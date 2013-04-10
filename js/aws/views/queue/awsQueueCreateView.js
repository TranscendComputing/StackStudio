/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
define([
        'jquery',
        'underscore',
        'backbone',
        'views/dialogView',
        'text!templates/aws/queue/awsQueueCreateTemplate.html',
        '/js/aws/models/queue/awsQueue.js',
        'common'      
], function( $, _, Backbone, DialogView, queueCreateTemplate, Queue, Common ) {
    
    var QueueCreateView = DialogView.extend({

        template: _.template(queueCreateTemplate),

        credentialId: undefined,

        region: undefined,

        queue: undefined,
        
        events: {
            "dialogclose": "close"
        },

        initialize: function(options) {
            this.credentialId = options.cred_id;
            this.region = options.region;
        },

        render: function() {
            var createView = this;
            this.$el.html(this.template);

            this.$el.dialog({
                autoOpen: true,
                title: "Create Queue",
                width:650,
                minHeight: 150,
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
            this.queue = new Queue();
            $("select").selectmenu();
        },
        
        create: function() {
            var createView = this;
            var newQueue = this.queue;
            var options = {};
            var issue = false;

            if($("#queue_name_input").val() !== "") {
                options.QueueName = $("#queue_name_input").val();
            }else {
                issue = true;
            }
            //Validation
            if($("#visibility_timeout_input").val() !== "") {
                var visibilityInt = parseInt($("#visibility_timeout_input").val(), 10);
                var visibilityUnitInt = parseInt($("#visitibility_timeout_unit_select").val(), 10);
                var visibilityValue = visibilityInt * visibilityUnitInt;
                if(visibilityValue >= 0 && visibilityValue <= 43200) {
                    options.VisibilityTimeout = visibilityValue; 
               }else {
                    issue = true;
               }
            }else {
                issue = true;
            }

            if($("#retention_period_input").val() !== "") {
                var retentionInt = parseInt($("#retention_period_input").val(), 10);
                var retentionUnitInt = parseInt($("#retention_period_unit_select").val(), 10);
                var retentionValue = retentionInt * retentionUnitInt;
                if(retentionValue >= 60 && retentionValue <= 1209600) {
                    options.MessageRetentionPeriod = retentionValue; 
               }else {
                    issue = true;
               }
            }else {
                issue = true;
            }

            if($("#maximum_message_size_input").val() !== "") {
                var maxMessageSizeInt = parseInt($("#maximum_message_size_input").val(), 10);
                var maxMessageSizeValue = maxMessageSizeInt * 1024;
                if(maxMessageSizeValue >= 1024  && maxMessageSizeValue <= 65536) {
                    options.MaximumMessageSize = maxMessageSizeValue;
               }else {
                    issue = true;
               }
            }else {
                issue = true;
            }

            if($("#delivery_delay_input").val() !== "") {
                var delayInt = parseInt($("#delivery_delay_input").val(), 10);
                var delayUnitInt = parseInt($("#delivery_delay_unit_select").val(), 10);
                var delayValue = delayInt * delayUnitInt;
                if(delayValue >= 0 && delayValue <= 900) {
                    options.DelaySeconds = delayValue; 
               }else {
                    issue = true;
               }
            }else {
                issue = true;
            }

            if($("#receive_message_wait_time_input").val() !== "") {
                var receiveMessageWaitTimeInt = parseInt($("#receive_message_wait_time_input").val(), 10);
                if(receiveMessageWaitTimeInt >= 0  && receiveMessageWaitTimeInt <= 20) {
                    options.ReceiveMessageWaitTimeSeconds = receiveMessageWaitTimeInt; 
               }else {
                    issue = true;
               }
            }else {
                issue = true;
            }
            //Create if no issues exist
            if(!issue) {
                newQueue.create(options, this.credentialId, this.region);
                this.$el.dialog('close');
            }else {
                Common.errorDialog("Invalid Request", "Please supply all required fields correctly.");
            }
        }
    });
    
    return QueueCreateView;
});
