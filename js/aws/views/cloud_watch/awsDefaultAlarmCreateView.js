/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true alert:true*/
define([
        'jquery',
        'underscore',
        'backbone',
        'views/dialogView',
        'text!templates/aws/cloud_watch/awsAlarmCreateTemplate.html',
        '/js/aws/models/cloud_watch/awsAlarm.js',
        '/js/aws/collections/cloud_watch/awsMetrics.js',
        '/js/aws/collections/notification/awsTopics.js',
        'common'
        
], function( $, _, Backbone, DialogView, alarmCreateTemplate, Alarm, Metrics, Topics, Common ) {
    
    /**
     * awsAlarmCreateView is UI form to create compute.
     *
     * @name InstanceCreateView
     * @constructor
     * @category CloudWatch
     * @param {Object} initialization object.
     * @returns {Object} Returns a awsAlarmCreateView instance.
     */
    
    var AwsAlarmCreateView = DialogView.extend({
        
        credentialId: undefined,

        region: undefined,
        
        metrics: new Metrics(),
        
        topics: new Topics(),
        
        tList: undefined,
        
        alarm: new Alarm(),
        
        selectedAction: undefined,
        
        policy_view: undefined,
        
        // Delegated events for creating new alarms, etc.
        events: {
            "dialogclose": "close",
            "click #actions_table tr": 'selectAction',
            "click #add_action_button": "addAction",
            "click #remove_action_button": "removeAction"
        },

        initialize: function(options) {
            this.credentialId = options.cred_id;
            this.region = options.region;
            this.policy_view = options.policy_view;
            this.tList = options.tList;
            var createView = this;
            var compiledTemplate = _.template(alarmCreateTemplate);
            this.$el.html(compiledTemplate);

            this.$el.dialog({
                autoOpen: true,
                title: "Create Alarm",
                width:600,
                minHeight:500,
                resizable: false,
                modal: true,
                buttons: {
                    Create: function () {
                        createView.create();
                    },
                    Cancel: function() {
                        createView.cancel();
                    }
                }
            });
            $("#accordion").accordion();
            $("button").button();
            $('#actions_table').dataTable({
                "bJQueryUI": true,
                bLengthChange: false,
                bFilter: false,
                bInfo: false,
                bPaginate : false
            }); 
            $("#namespace_select").change(function() {
                createView.namespaceChange();
            });
            this.metrics.on( 'reset', this.addAllMetrics, this );
            this.namespaceChange();
            this.topics.on( 'reset', this.addAllTopics, this );
            this.topics.fetch({ 
                data: $.param({ cred_id: this.credentialId, region: this.region }),
                reset: true
            });
        },

        render: function() {
            
        },
        
        namespaceChange: function() {
            $("#metric_select").empty();
            $("#metric_select").append("<option value='none'>No Metrics Available</option>");
            switch($("#namespace_select").val()) 
            {
            case "AWS/EBS":
                this.metrics.fetch({ data: $.param({ cred_id: this.credentialId, region: this.region, filters: {"Namespace": "AWS/EBS", "Dimensions":"VolumeId"}}), reset: true });
                break;
            case "AWS/EC2":
                this.metrics.fetch({ data: $.param({ cred_id: this.credentialId, region: this.region, filters: {"Namespace": "AWS/EC2", "Dimensions":"InstanceId"}}), reset: true });
                break;
            case "AWS/ELB":
                this.metrics.fetch({ data: $.param({ cred_id: this.credentialId, region: this.region, filters: {"Namespace": "AWS/ELB", "Dimensions":"LoadBalancerName"}}), reset: true });
                break;
            case "AWS/RDS":
                this.metrics.fetch({ data: $.param({ cred_id: this.credentialId, region: this.region, filters: {"Namespace": "AWS/RDS", "Dimensions":"DBInstanceIdentifier"}}), reset: true });
                break;
            case "AWS/SNS":
                this.metrics.fetch({ data: $.param({ cred_id: this.credentialId, region: this.region, filters: {"Namespace": "AWS/SNS", "Dimensions":"TopicName"}}), reset: true });
                break;
            case "AWS/SQS":
                this.metrics.fetch({ data: $.param({ cred_id: this.credentialId, region: this.region, filters: {"Namespace": "AWS/SQS", "Dimensions":"QueueName"}}), reset: true });
                break;
            }
        },
        
        addAllMetrics: function() {
            $("#metric_select").empty();
            if(this.metrics.length > 0) {
                this.metrics.each(function (metric) {
                    if(metric.attributes.dimensions.length > 0) {
                        $("#metric_select").append("<option value='" + JSON.stringify(metric.attributes) + "'>" + metric.attributes.name + "</option>"); 
                    }
                });
            }else {
               $("#metric_select").append("<option value='none'>No Metrics Available</option>"); 
            }
        },
        
        addAllTopics: function() {
            $("#sns_topic_select").empty();
            var list = this.tList;
            this.topics.each(function(topic) {
                if($.inArray(topic.attributes.id, list) !== -1){
                    $("#sns_topic_select").append("<option value='" + topic.attributes.id + "'>" + topic.attributes.Name + "</option>");
                }
            });
        },
        
        selectAction: function(event) {
            $("#actions_table tr").removeClass("row_selected");
            this.selectedAction = $("#actions_table").dataTable().fnGetData(event.currentTarget);
            $(event.currentTarget).addClass("row_selected");
        },
        
        addAction: function() {
            if($("#alarm_state_select").val() !== null) {
                var rowData = [$("#alarm_state_select").val(), "Send Notification", $("#sns_topic_select").val()];
                $("#actions_table").dataTable().fnAddData(rowData);
            }
        },
        
        removeAction: function() {
            if(this.selectedAction) {
                $("#actions_table").dataTable().fnDeleteRow($("#actions_table .row_selected")[0]);
                this.selectedAction = undefined;
            }
        },
        
        create: function() {
            var newAlarm = this.alarm;
            var options = {};
            var issue = false;

            if($("#alarm_name").val() !== "") {
                options.id = $("#alarm_name").val();
            }else {
                issue = true;
            }
            
            if($("#alarm_description").val() !== "") {
                options.alarm_description = $("alarm_description").val();
            }
            
            if($("#metric_select").val() !== "none" && $("#metric_select").val !== null) {
                var metric = JSON.parse($("#metric_select").val());
                options.dimensions = metric.dimensions;
                options.metric_name = metric.name;
            }
            
            if($("#threshold_input").val() !== "") {
                var thresholdInt = parseInt($("#threshold_input").val(), 10);
                if(isNaN(thresholdInt)) {
                    issue = true;
                }else {
                    options.threshold = thresholdInt;
                }
            }
            options.namespace = $("#namespace_select").val();
            options.comparison_operator = $("#comparison_select").val();
            options.statistic = $("#statistic_select").val();
            var period = JSON.parse($("#period_select").val());
            options.period = period.period;
            options.evaluation_periods = period.evaluation;
            options.alarm_actions = [];
            options.ok_actions = [];
            options.insufficient_data_actions = [];
            var actionsArray = $("#actions_table").dataTable().fnGetData();
            $.each(actionsArray, function(index, rowData) {
                switch(rowData[0])
                {
                case "ALARM":
                    options.alarm_actions.push(rowData[2]);
                    break;
                case "OK":
                    options.ok_actions.push(rowData[2]);
                    break;
                case "INSUFFICIENT_DATA":
                    options.insufficient_data_actions.push(rowData[2]);
                    break;
                }
            });
            
            if(!issue) {
                //newAlarm.create(options, this.credentialId, this.region);
                this.policy_view.addAlarm(options);
                this.$el.dialog('close');
            }else {
                Common.errorDialog("Invalid Request", "Please supply all required fields.");
            }
        }

    });
    
    return AwsAlarmCreateView;
});
