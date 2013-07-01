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
        'text!templates/aws/cache/awsCacheClusterCreateTemplate.html',
        '/js/aws/models/cache/awsCacheCluster.js',
        '/js/aws/collections/rds/awsDBEngineVersions.js',
        '/js/aws/collections/cache/awsCacheParameterGroups.js',
        '/js/aws/collections/cache/awsCacheSecurityGroups.js',
        '/js/aws/collections/compute/awsAvailabilityZones.js',
        'common',
        'jquery.ui.selectmenu',
        'jquery.multiselect',
        'jquery.multiselect.filter'
        
], function( $, _, Backbone, DialogView, clusterCreateTemplate, CacheCluster, DBEngineVersions, DBParameterGroups, DBSecurityGroups, AvailabilityZones, Common ) {
    
    var ClusterCreateView = DialogView.extend({

        credentialId: undefined,

        region: undefined,

        currentViewIndex: undefined,

        dbEngineVersions: undefined,

        dbParameterGroups: undefined,

        dbSecurityGroups: undefined,

        availabilityZones: undefined,

        availableEngineVersions: undefined,

        storageSizeMinimum: undefined,

        cacheCluster: new CacheCluster(),
 
        events: {
            "dialogclose": "close",
            "click input[name='backup_window']": "backupWindowEnabled",
            "click input[name='maintenance_window']": "maintenanceWindowEnable"
        },

        initialize: function(options) {
            this.credentialId = options.cred_id;
            this.region = options.region;
        },

        render: function() {
            var createView = this;
            var compiledTemplate = _.template(clusterCreateTemplate);
            this.$el.html(compiledTemplate);

            this.$el.dialog({
                autoOpen: true,
                title: "Cache Cluster Wizard",
                width:625,
                minHeight: 150,
                resizable: false,
                modal: true,
                buttons: {
                    Previous: {
                        text: "Previous",
                        id: "previous_button",
                        click: function() {
                            createView.previous();
                        }
                    },
                    Next: {
                        text: "Next",
                        id: "next_button",
                        click: function() {
                            createView.next();
                        }
                    }
                }
            });
            
            $("#security_group_select").multiselect({
                selectedList: 3,
                noneSelectedText: "Select Security Group(s)"
            }).multiselectfilter();
            
            $("#parameter_group_select").selectmenu();
            $("#node_type_select").selectmenu();
            
            this.dbParameterGroups = new DBParameterGroups();
            this.dbParameterGroups.on('reset', this.addAllParameterGroups, this);
            this.dbParameterGroups.fetch({ 
                data: $.param({ cred_id: this.credentialId, region: this.region}),
                reset: true
            });
            
            this.dbSecurityGroups = new DBSecurityGroups();
            this.dbSecurityGroups.on('reset', this.addAllSecurityGroups, this);
            this.dbSecurityGroups.fetch({ 
                data: $.param({ cred_id: this.credentialId, region: this.region}),
                reset: true
            });
            
            this.backupWindowEnabled();
            this.maintenanceWindowEnable();
            
            this.refreshView(0);
            
            this.setupEngineSpecifics();
        },

        next: function() {
            if(this.currentViewIndex === 0) {
                if(this.validateInputFields(this.currentViewIndex)) {
                    this.create(); 
                }
                
            }else {
                if(this.currentViewIndex === 1) {
                    this.setupEngineSpecifics();
                }
                
                if(this.validateInputFields(this.currentViewIndex)) {
                    this.currentViewIndex++;
                    this.refreshView(this.currentViewIndex); 
                }
            }
        },

        previous: function() {
            this.currentViewIndex--;
            this.refreshView(this.currentViewIndex);
        },

        refreshView: function (viewIndex) {
            $(".view_stack").hide();
            $("#view"+viewIndex).show();
            this.currentViewIndex = viewIndex;

            if(this.currentViewIndex <= 2) {
                $("#previous_button").addClass("ui-state-disabled");
                $("#previous_button").attr("disabled", true);
            }else {
                $("#previous_button").removeClass("ui-state-disabled");
                $("#previous_button").attr("disabled", false);
            }

            if(this.currentViewIndex === 0) {
                this.renderReviewScreen();
                $("#next_button span").text("Create");
            }else {
                $("#next_button span").text("Next");
            }
            $("#next_button").button();
        },

        setupEngineSpecifics: function() {
            /*
                Setup Cluster Engine
            */
            $("#node_type_select").append("<option value='cache.t1.micro'>cache.t1.micro</option>"+
                                          "<option value='cache.m1.small'>cache.m1.small</option>"+
                                          "<option value='cache.m1.medium'>cache.m1.medium</option>"+
                                          "<option value='cache.m1.large'>cache.m1.large</option>"+
                                          "<option value='cache.m1.xlarge'>cache.m1.xlarge</option>"+
                                          "<option value='cache.m3.xlarge'>cache.m3.xlarge</option>"+
                                          "<option value='cache.m3.2xlarge'>cache.m3.2xlarge</option>"+
                                          "<option value='cache.m2.xlarge'>cache.m2.xlarge</option>"+
                                          "<option value='cache.m2.2xlarge'>cache.m2.2xlarge</option>"+
                                          "<option value='cache.m2.4xlarge'>cache.m2.4xlarge</option>"+
                                          "<option value='cache.c1.xlarge'>cache.c1.xlarge</option>");
            $("#node_type_select").selectmenu();
            
            $("#selected_cluster_engine_label").html($("#engine_select").val());
            
        },

        validateInputFields: function(viewIndex) {
            var valid = true;
            if(viewIndex === 0) {
                
                if($("#cluster_id_input").val().trim() !== "") {
                    this.displayValid(true, "#cluster_id_input");
                }else{
                    valid = false;
                    this.displayValid(false, "#cluster_id_input");
                }
                
                var nodesInt = parseInt($("#num_nodes_input").val(), 10);
                if(nodesInt >= 1 && nodesInt <= 20) {
                    this.displayValid(true, "#num_nodes_input");
                }else {
                    valid = false;
                    this.displayValid(false, "#num_nodes_input");
                }
                
                var portInt = parseInt($("#cache_port_input").val(), 10);
                if(portInt >= 0 && portInt <= 65535) {
                    this.displayValid(true, "#cache_port_input");
                }else {
                    valid = false;
                    this.displayValid(false, "#cache_port_input");
                }

            }
            return valid;
        },

        addAllSecurityGroups: function() {
            $("#security_group_select").empty();
            this.dbSecurityGroups.each(function(security_group) {
                $("#security_group_select").append("<option value="+security_group.attributes.id+">"+security_group.attributes.id+"</option>");
            });
            $("#security_group_select").multiselect("refresh");
        },
        
        addAllParameterGroups: function() {
            
            
            //$("#parameter_group_select").empty();
            this.dbParameterGroups.each(function(parameter_group) {
                $("#parameter_group_select").append("<option value="+parameter_group.attributes.id+">"+parameter_group.attributes.id+"</option>");
            });
            $("#parameter_group_select").selectmenu();
        },

        displayValid: function(valid, selector) {
            if(valid) {
                $(selector).css("border-color", "");
            }else{
                $(selector).css("border-color", "#FF0000");
            }
        },

        backupWindowEnabled: function() {
            if($("input[name='backup_window']:checked").val() === "no_preference") {
                $("#backup_window_options select").attr("disabled", true);
                $("#backup_window_options").addClass("ui-state-disabled");
            }else {
                $("#backup_window_options select").removeAttr("disabled");
                $("#backup_window_options").removeClass("ui-state-disabled");
            }
            $("#backup_window_options select").selectmenu();
        },

        maintenanceWindowEnable: function() {
            if($("input[name='maintenance_window']:checked").val() === "no_preference") {
                $("#maintenance_window_options select").attr("disabled", true);
                $("#maintenance_window_options").addClass("ui-state-disabled");
            }else {
                $("#maintenance_window_options select").removeAttr("disabled");
                $("#maintenance_window_options").removeClass("ui-state-disabled");
            }
            $("#maintenance_window_options select").selectmenu();
        },

        getBackUpWindowString: function() {
            var backupWindowString = "";
            if($("input[name='backup_window']:checked").val() === "no_preference") {
                backupWindowString = "No Preference";
            }else {
                backupWindowString = $("#backup_start_time_hour_select").val() + ":" + $("#backup_start_time_minute_select").val() + "-";
                var bwDur = this.getDurationInMinutes($("#backup_duration").val());
                var bwMinute = parseInt($("#backup_start_time_minute_select").val(), 10);
                var bwHour = parseInt($("#backup_start_time_hour_select").val(), 10);
                var bwEndMinute = ((bwMinute + bwDur) % 60);
                var bwEndHour = ((bwHour + Math.floor((bwMinute + bwDur) / 60)) % 24);
                backupWindowString = backupWindowString + this.setTimeString(bwEndHour) + ":" + this.setTimeString(bwEndMinute);
            }
            return backupWindowString;
        },

        getDurationInMinutes: function(durationString) {
            var durationMinutes = 0;
            switch(durationString)
            {
                case "0.5":
                    durationMinutes = 30;
                    break;
                case "1":
                    durationMinutes = 60;
                    break;
                case "1.5":
                    durationMinutes = 90;
                    break;
                case "2":
                    durationMinutes = 120;
                    break;
                case "2.5":
                    durationMinutes = 150;
                    break;
                case "3":
                    durationMinutes = 180;
                    break;
            }
            return durationMinutes;
        },

        getMaintenanceWindowString: function() {
            var maintWindowString = "";
            if($("input[name='maintenance_window']:checked").val() === "no_preference") {
                maintWindowString = "No Preference";
            }else {
                maintWindowString = $("#maintenance_start_time_day_select").val() + ":" + $("#maintenance_start_time_hour_select").val() + ":" + $("#maintenance_start_time_minute_select").val() + "-";
                var mwDur = this.getDurationInMinutes($("#maintenance_duration").val());
                var mwMinute = parseInt($("#maintenance_start_time_minute_select").val(), 10);
                var mwHour = parseInt($("#maintenance_start_time_hour_select").val(), 10);
                var mwEndMinute = ((mwMinute + mwDur) % 60);
                var mwEndHour = ((mwHour + Math.floor((mwMinute + mwDur) / 60)) % 24);
                var mwEndDay = $("#maintenance_start_time_day_select").val();
                //Add a day if the duration rolls to the next day
                if((mwHour + (mwMinute + mwDur / 60) / 24) > 1)
                {
                    switch($("#maintenance_start_time_day_select").val())
                    {
                        case "mon":
                            mwEndDay = "tue";
                            break;
                        case "tue":
                            mwEndDay = "wed";
                            break;
                        case "wed":
                            mwEndDay = "thu";
                            break;
                        case "thu":
                            mwEndDay = "fri";
                            break;
                        case "fri":
                            mwEndDay = "sat";
                            break;
                        case "sat":
                            mwEndDay = "sun";
                            break;
                        case "sun":
                            mwEndDay = "mon";
                            break;
                    }
                }
                maintWindowString = maintWindowString + mwEndDay + ":" + this.setTimeString(mwEndHour) + ":" + this.setTimeString(mwEndMinute);
            }
            return maintWindowString;
        },

        setTimeString: function(timeSection) {
            var timeSectionString;
            if(timeSection < 10) {
                timeSectionString = "0" + timeSection.toString();
            }else {
                timeSectionString = timeSection.toString();
            }
            return timeSectionString;
        },

        renderReviewScreen: function() {
            
            $("#cluster_id_review").html($("#cluster_id_input").val());
            $("#node_type_review").html($("#node_type_select").val());
            $("#num_nodes_review").html($("#num_nodes_input").val());
            $("#selected_cluster_engine_review").html($("#selected_cluster_engine_label").html());
            $("#cache_port_review").html($("#cache_port_input").val());
            $("#auto_version_review").html($("#auto_version_input").val());
            
            $("#db_parameter_group_review").html($("#parameter_group_select").val());
            
            var securityGroupString = "";
            if($("#security_group_select").val()) {
                $.each($("#security_group_select").val(), function(index, value) {
                securityGroupString = securityGroupString + value + ", ";
                });
            }else {
                securityGroupString = "N/A";
            }
            $("#db_security_groups_review").html(securityGroupString);
            
        },

        create: function() {
            var newCluster = this.cacheCluster;
            var options = {};
            
            options.id = $("#cluster_id_input").val();
            options.node_type = $("#node_type_select").val();
            options.num_nodes = $("#num_nodes_input").val();
            options.engine = $("#selected_cluster_engine_label").html();
            options.auto_minor_version_upgrade = $("#auto_version_input").val();
            
            if($("#cache_port_input").val().trim() !== "") {
                options.port = $("#cache_port_input").val();
            }
            
            options.parameter_group_name = $("#parameter_group_select").val();
            
            if($("#security_group_select").val()) {
                options.security_group_names = $("#security_group_select").val();
            }

            newCluster.create(options, this.credentialId, this.region);
            this.$el.dialog('close');
        }

    });
    
    return ClusterCreateView;
});
