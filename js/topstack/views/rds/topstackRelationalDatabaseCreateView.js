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
        'text!templates/topstack/rds/topstackRelationalDatabaseCreateTemplate.html',
        '/js/topstack/models/rds/topstackRelationalDatabase.js',
        '/js/topstack/collections/rds/topstackDBEngineVersions.js',
        '/js/topstack/collections/rds/topstackDBParameterGroups.js',
        '/js/topstack/collections/rds/topstackDBSecurityGroups.js',
        'common',
        'jquery.ui.selectmenu',
        'jquery.multiselect',
        'jquery.multiselect.filter'
        
], function( $, _, Backbone, DialogView, databaseCreateTemplate, RelationalDatabase, DBEngineVersions, DBParameterGroups, DBSecurityGroups, Common ) {
    
    var RelationalDatabaseCreateView = DialogView.extend({

        credentialId: undefined,

        region: undefined,

        currentViewIndex: undefined,

        dbEngineVersions: undefined,

        dbParameterGroups: undefined,

        dbSecurityGroups: undefined,

        availabilityZones: undefined,

        availableEngineVersions: undefined,

        storageSizeMinimum: undefined,

        relationalDatabase: new RelationalDatabase(),
 
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
            var compiledTemplate = _.template(databaseCreateTemplate);
            this.$el.html(compiledTemplate);

            this.$el.dialog({
                autoOpen: true,
                title: "Relational Database Wizard",
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
            $("select").selectmenu();
            $("#security_group_select").selectmenu("destroy");
            $("#security_group_select").multiselect({
                selectedList: 3,
                noneSelectedText: "Select Security Group(s)"
            }).multiselectfilter();
            this.dbEngineVersions = new DBEngineVersions();
            this.dbEngineVersions.fetch({ 
                data: $.param({ cred_id: this.credentialId, region: this.region}),
                reset: true
            });
            this.dbParameterGroups = new DBParameterGroups();
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
            var AvailabilityZonesType = this.availabilityZonesType;
            this.availabilityZones = new AvailabilityZonesType();
            this.availabilityZones.on('reset', this.addAllAvailabilityZones, this);
            this.availabilityZones.fetch({ 
                data: $.param({ cred_id: this.credentialId, region: this.region}),
                reset: true
            });
            this.backupWindowEnabled();
            this.maintenanceWindowEnable();
            this.refreshView(1);
        },

        next: function() {
            if(this.currentViewIndex === 5) {
                this.create();
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

            if(this.currentViewIndex === 1) {
                $("#previous_button").addClass("ui-state-disabled");
                $("#previous_button").attr("disabled", true);
            }else {
                $("#previous_button").removeClass("ui-state-disabled");
                $("#previous_button").attr("disabled", false);
            }

            if(this.currentViewIndex === 5) {
                this.renderReviewScreen();
                $("#next_button span").text("Create");
            }else {
                $("#next_button span").text("Next");
            }
            $("#next_button").button();
        },

        setupEngineSpecifics: function() {
            $("#selected_engine_label").html($("#engine_select").val());

            //Setup License Model Options
            $("#licence_model_select").empty();
            if($("#engine_select").val() === "mysql") {
                $("#licence_model_select").append("<option value='general-public-license'>General Public License</option>");
            }else if($("#engine_select").val() === "oracle-se1" || $("#engine_select").val() === "sqlserver-se") {
                $("#licence_model_select").append(  "<option value='bring-your-own-license'>Bring You Own License</option>" +
                                                    "<option value='license-included'>License Included</option>");
            }else if($("#engine_select").val() === "oracle-se" || $("#engine_select").val() === "oracle-ee" || $("#engine_select").val() === "sqlserver-ee") {
                $("#licence_model_select").append("<option value='bring-your-own-license'>Bring You Own License</option>");
            }else if($("#engine_select").val() === "sqlserver-ex" || $("#engine_select").val() === "sqlserver-web") {
                $("#licence_model_select").append("<option value='license-included'>License Included</option>");
            }
            $("#licence_model_select").selectmenu();

            //Setup Engine Version Options
            $("#engine_version_select").empty();
            this.dbEngineVersions.each(function(engineVersion) {
                if(engineVersion.attributes.Engine === $("#engine_select").val()) {
                    $("#engine_version_select").append("<option value="+ engineVersion.attributes.EngineVersion +">"+ engineVersion.attributes.EngineVersion +"</option>");
                }
            });
            $("#engine_version_select").selectmenu();

            //Setup Instance Class Options
            $("#instance_class_select").empty();
            if($("#engine_select").val() === "sqlserver-ex") {
                $("#instance_class_select").append( "<option value='db.t1.micro'>db.t1.micro</option>" +
                                                    "<option value='db.m1.small'>db.m1.small</option>");
            }else {
                $("#instance_class_select").append( "<option value='db.t1.micro'>db.t1.micro</option>" +
                                                    "<option value='db.m1.small'>db.m1.small</option>" +
                                                    "<option value='db.m1.medium'>db.m1.medium</option>" +
                                                    "<option value='db.m1.large'>db.m1.large</option>" +
                                                    "<option value='db.m1.xlarge'>db.m1.xlarge</option>" +
                                                    "<option value='db.m2.xlarge'>db.m2.xlarge</option>" +
                                                    "<option value='db.m2.2xlarge'>db.m2.2xlarge</option>" +
                                                    "<option value='db.m2.4xlarge'>db.m2.4xlarge</option>");
            }
            $("#instance_class_select").selectmenu();

            //Setup Multi AZ Deployment Options
            $("#multi_az_deployment_select").empty();
            if($("#engine_select").val() === "sqlserver-ex" || $("#engine_select").val() === "sqlserver-web" || $("#engine_select").val() === "sqlserver-se" || $("#engine_select").val() === "sqlserver-ee") {
                $("#multi_az_deployment_select").append("<option value='false'>No</option>");
            }else {
                $("#multi_az_deployment_select").append("<option value='false'>No</option>" +
                                                        "<option value='true'>Yes</option>");
            }
            $("#multi_az_deployment_select").selectmenu();

            //Setup Storage label
            this.setupStorageLabel();

            //Setup Default Port
            if($("#engine_select").val() === "mysql") {
                $("#database_port_input").val("3306");
            }else if($("#engine_select").val() === "oracle-se" || $("#engine_select").val() === "oracle-se1" || $("#engine_select").val() === "oracle-ee") {
                $("#database_port_input").val("1521");
            }else if($("#engine_select").val() === "sqlserver-ex" || $("#engine_select").val() === "sqlserver-web" || $("#engine_select").val() === "oracle-ee") {
                $("#database_port_input").val("1433");
            }
        },

        setupStorageLabel: function() {
            if($("#engine_select").val() === "mysql") {
                this.storageSizeMinimum = 5;
            }else if($("#engine_select").val() === "oracle-se" || $("#engine_select").val() === "oracle-se1" || $("#engine_select").val() === "oracle-ee") {
                this.storageSizeMinimum = 10;
            }else if($("#engine_select").val() === "sqlserver-ex" || $("#engine_select").val() === "sqlserver-web") {
                this.storageSizeMinimum = 20;
            }else if($("#engine_select").val() === "sqlserver-se" || $("#engine_select").val() === "sqlserver-ee") {
                this.storageSizeMinimum = 200;
            }

            $("#storage_label").html("(between "+this.storageSizeMinimum+" - 3072 GBs)");
        },

        validateInputFields: function(viewIndex) {
            var valid = true;
            if(viewIndex === 2) {
                var storageInt = parseInt($("#storage_input").val(), 10);
                if(storageInt >= this.storageSizeMinimum && storageInt <= 3072) {
                    this.displayValid(true, "#storage_input");
                }else {
                    valid = false;
                    this.displayValid(false, "#storage_input");
                }
                if($("#id_input").val().trim() !== "") {
                    this.displayValid(true, "#id_input");
                }
                else{
                    valid = false;
                    this.displayValid(false, "#id_input");
                }
                if($("#master_username_input").val().trim() !== "") {
                    this.displayValid(true, "#master_username_input");
                }
                else{
                    valid = false;
                    this.displayValid(false, "#master_username_input");
                }
                if($("#master_password_input").val().trim() !== "" && $("#master_password_input").val().length >= 8) {
                    this.displayValid(true, "#master_password_input");
                }else {
                    valid = false;
                    this.displayValid(false, "#master_password_input");
                }

                if($("#multi_az_deployment_select").val() === "true") {
                    $("#availability_zone_row").hide();
                }else {
                    $("#availability_zone_row").show();
                }

                //Add the available parameter groups
                var selectedDBEngineVersion = this.dbEngineVersions.get($("#engine_version_select").val());
                if(selectedDBEngineVersion) {
                    $("#parameter_group_select").empty();
                    $("#parameter_group_select").append("<option value='default."+selectedDBEngineVersion.attributes.DBParameterGroupFamily+"'>default."+selectedDBEngineVersion.attributes.DBParameterGroupFamily+"</option>");
                    this.dbParameterGroups.each(function(param_group) {
                        if(param_group.attributes.family === selectedDBEngineVersion.attributes.DBParameterGroupFamily && param_group.attributes.id !== "default."+selectedDBEngineVersion.attributes.DBParameterGroupFamily) {
                            $("#parameter_group_select").append("<option value="+param_group.attributes.id+">"+param_group.attributes.id+"</option>");
                        }
                    });
                    $("#parameter_group_select").selectmenu();
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

        addAllAvailabilityZones: function() {
            $("#availability_zone_select").empty();
            this.availabilityZones.each(function(az) {
                $("#availability_zone_select").append("<option value="+az.attributes.name+">"+az.attributes.name+"</option>");
            });
            $("#availability_zone_select").selectmenu();
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
            $("#engine_review").html($("#engine_select").val());
            $("#engine_version_review").html($("#engine_version_select").val());
            $("#license_review").html($("#licence_model_select").val());
            $("#auto_minor_upgrade_review").html($("input[name='auto_minor_version_upgrade']:checked").val());
            $("#instance_class_review").html($("#instance_class_select").val());
            $("#multi_az_review").html($("#multi_az_deployment_select").val());
            $("#storage_review").html($("#storage_input").val() + " GBs");
            $("#instance_identifier_review").html($("#id_input").val());
            $("#master_user_name_review").html($("#master_username_input").val());
            $("#db_name_review").html($("#database_name_input").val());
            $("#db_port_review").html($("#database_port_input").val());
            if($("#multi_az_deployment_select").val() === "false") {
                if($("#availability_zone_select").val()) {
                    $("#availability_zone_review").html($("#availability_zone_select").val());
                }else {
                    $("#availability_zone_review").html("No Preference");
                }
            }else {
                $("#availability_zone_review").html("Multi-AZ Deployment disables this option.");
            }
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
            $("#backup_retention_period_review").html($("#backup_retention_select").val());
            var backupString = this.getBackUpWindowString();
            $("#backup_window_review").html(backupString);
            var maintenanceString = this.getMaintenanceWindowString();
            $("#maintenance_window_review").html(maintenanceString);
        },

        create: function() {
            var newDB = this.relationalDatabase;
            var options = {};

            options.id = $("#id_input").val();
            options.allocated_storage = $("#storage_input").val();
            options.engine = $("#engine_select").val();
            options.engine_version = $("#engine_version_select").val();
            options.master_username = $("#master_username_input").val();
            options.password = $("#master_password_input").val();
            options.auto_minor_version_upgrade = $("input[name='auto_minor_version_upgrade']:checked").val();
            options.flavor_id = $("#instance_class_select").val();
            options.license_model = $("#licence_model_select").val();
            options.multi_az = $("#multi_az_deployment_select").val();
            if($("#multi_az_deployment_select").val() === "false" && $("#availability_zone_select").val() !== "false") {
                options.availability_zone = $("#availability_zone_select").val();
            }
            options.backup_retention_period = $("#backup_retention_select").val();
            if($("#database_name_input").val().trim() !== "") {
                options.db_name = $("#database_name_input").val();
            }
            if($("#database_port_input").val().trim() !== "") {
                options.port = $("#database_port_input").val();
            }
            options.parameter_group_name = $("#parameter_group_select").val();
            if($("input[name='backup_window']:checked").val() !== "no_preference") {
                options.preferred_backup_window = this.getBackUpWindowString();
            }
            if($("input[name='maintenance_window']:checked").val() !== "no_preference") {
                options.preferred_maintenance_window = this.getMaintenanceWindowString();
            }
            if($("#security_group_select").val()) {
                options.security_group_names = $("#security_group_select").val();
            }

            newDB.create(options, this.credentialId, this.region);
            this.$el.dialog('close');
        }

    });
    
    return RelationalDatabaseCreateView;
});
