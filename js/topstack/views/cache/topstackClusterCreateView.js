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
        'text!templates/topstack/cache/topstackCacheClusterCreateTemplate.html',
        '/js/topstack/models/cache/topstackCacheCluster.js',
        '/js/topstack/collections/cache/topstackCacheParameterGroups.js',
        '/js/topstack/collections/cache/topstackCacheSecurityGroups.js',
        'common',
        'jquery.ui.selectmenu',
        'jquery.multiselect',
        'jquery.multiselect.filter'
        
], function( $, _, Backbone, DialogView, clusterCreateTemplate, CacheCluster, ParameterGroups, SecurityGroups, Common ) {
    
    var ClusterCreateView = DialogView.extend({

        credentialId: undefined,

        region: undefined,

        currentViewIndex: undefined,

        cacheParameterGroups: undefined,

        cacheSecurityGroups: undefined,

        availabilityZones: undefined,

        availableEngineVersions: undefined,

        storageSizeMinimum: undefined,

        cacheCluster: new CacheCluster(),
 
        events: {
            "dialogclose": "close",
            "click input[name='maintenance_window']": "maintenanceWindowEnable"
        },

        render: function() {
            var createView = this;
            var compiledTemplate = _.template(clusterCreateTemplate);
            this.$el.html(compiledTemplate);

            this.$el.dialog({
                autoOpen: true,
                title: "Create Cache Cluster",
                width:625,
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
            $("#accordion").accordion({ heightStyle: "fill" });
            
            $("#security_group_select").multiselect({
                selectedList: 3,
                noneSelectedText: "Select Security Group(s)"
            }).multiselectfilter();
            
            $("#parameter_group_select").selectmenu();
            $("#node_type_select").selectmenu();
            $("#engine_select").selectmenu();
            
            this.cacheParameterGroups = new ParameterGroups();
            this.cacheParameterGroups.on('reset', this.addAllParameterGroups, this);
            this.cacheParameterGroups.fetch({ 
                data: $.param({ cred_id: this.credentialId, region: this.region}),
                reset: true
            });
            
            this.cacheSecurityGroups = new SecurityGroups();
            this.cacheSecurityGroups.on('reset', this.addAllSecurityGroups, this);
            this.cacheSecurityGroups.fetch({ 
                data: $.param({ cred_id: this.credentialId, region: this.region}),
                reset: true
            });
            
            var AvailabilityZonesType = this.availabilityZonesType;
            this.availabilityZones = new AvailabilityZonesType();
            this.availabilityZones.on('reset', this.addAllAvailabilityZones, this);
            this.availabilityZones.fetch({ 
                data: $.param({ cred_id: this.credentialId, region: this.region}),
                reset: true
            });
            
            this.maintenanceWindowEnable();
            this.setupNodeType();
        },

        setupNodeType: function() {
            $("#node_type_select").append("<option value='cache.m1.small'>cache.m1.small</option>"+
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

        addAllSecurityGroups: function() {
            $("#security_group_select").empty();
            this.cacheSecurityGroups.each(function(security_group) {
                $("#security_group_select").append("<option value="+security_group.attributes.id+">"+security_group.attributes.id+"</option>");
            });
            $("#security_group_select").multiselect("refresh");
        },
        
        addAllParameterGroups: function() {
            $("#parameter_group_select").empty();
            this.cacheParameterGroups.each(function(parameter_group) {
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

        create: function() {
            var newCluster = this.cacheCluster;
            var options = {};
            var issue = false;

            options.node_type = $("#node_type_select").val();
            options.engine = $("#engine_select").val();
            options.auto_minor_version_upgrade = $("#auto_version_input").val();

             if($("#cluster_id_input").val().trim() !== "") {
                this.displayValid(true, "#cluster_id_input");
                options.id = $("#cluster_id_input").val();
            }else{
                issue = true;
                this.displayValid(false, "#cluster_id_input");
            }
            
            var nodesInt = parseInt($("#num_nodes_input").val(), 10);
            if(nodesInt >= 1 && nodesInt <= 20) {
                this.displayValid(true, "#num_nodes_input");
                options.num_nodes = $("#num_nodes_input").val();
            }else {
                valid = true;
                this.displayValid(false, "#num_nodes_input");
            }
            
            var portInt = parseInt($("#cache_port_input").val(), 10);
            if(portInt > 1000 && portInt <= 65535) {
                this.displayValid(true, "#cache_port_input");
                options.port = $("#cache_port_input").val();
            }else {
                issue = true;
                this.displayValid(false, "#cache_port_input");
            }
            
            options.parameter_group_name = $("#parameter_group_select").val();
            
            if($("#security_group_select").val()) {
                options.security_group_names = $("#security_group_select").val();
            }
            
            if($("input[name='maintenance_window']:checked").val() !== "no_preference") {
                options.preferred_maintenance_window = this.getMaintenanceWindowString();
            }
            
            if($("#availability_zone_select").val() !== "false") {
                options.availability_zone = $("#availability_zone_select").val();
            }

            if(!issue) {
                newCluster.create(options, this.credentialId, this.region);
                this.$el.dialog('close');
            }
        },
        
        addAllAvailabilityZones: function() {
            $("#availability_zone_select").empty();
            $("#availability_zone_select").append("<option value='false'>No Preference</option>");
            this.availabilityZones.each(function(az) {
                $("#availability_zone_select").append("<option value="+az.attributes.name+">"+az.attributes.name+"</option>");
            });
            $("#availability_zone_select").selectmenu();
        }

    });
    
    return ClusterCreateView;
});
