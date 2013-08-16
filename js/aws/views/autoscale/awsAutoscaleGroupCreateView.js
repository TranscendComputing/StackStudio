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
        'text!templates/aws/autoscale/awsAutoscaleGroupCreateTemplate.html',
        '/js/aws/models/autoscale/awsAutoscaleGroup.js',
        '/js/aws/collections/compute/awsImages.js',
        '/js/aws/collections/compute/awsAvailabilityZones.js',
        '/js/aws/collections/compute/awsFlavors.js',
        '/js/aws/collections/compute/awsKeyPairs.js',
        '/js/aws/collections/compute/awsSecurityGroups.js',
        'common',
        'jquery.ui.selectmenu',
        'jquery.multiselect',
        'jquery.multiselect.filter'
        
], function( $, _, Backbone, DialogView, autoscaleGroupCreateTemplate, AutoscaleGroup, Images, AvailabilityZones, Flavors, KeyPairs, SecurityGroups, Common ) {
    
    var AutoscaleGroupCreateView = DialogView.extend({

        template: _.template(autoscaleGroupCreateTemplate),

        credentialId: undefined,

        region: undefined,
        
        images: new Images(),
        
        availabilityZones: new AvailabilityZones(),

        flavors: new Flavors(),
        
        keyPairs: new KeyPairs(),
        
        securityGroups: new SecurityGroups(),
        
        autoscaleGroup: new AutoscaleGroup(),
        
        // Delegated events for creating new instances, etc.
        events: {
            "focus #image_select": "openImageList",
            "dialogclose": "close",
            "change input[name=elasticity]": "elasticityChange",
            "change input[name=triggers]": "triggerRadioToggle"
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
                title: "Create Auto Scale Group",
                width:575,
                minHeight: 500,
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
            $("#accordion").accordion({
              heightStyle: "fill"
            }); 
            $("#availability_zone_select").multiselect({
                selectedList: 3,
                noneSelectedText: "Select AZ(s)"
            }).multiselectfilter();
            $("#flavor_select").selectmenu();
            $("#key_pair_select").selectmenu();
            $("#elasticity_radio_group").buttonset(); 
            $("#security_group_select").multiselect({
                selectedList: 3,
                noneSelectedText: "Select Security Group(s)"
            }).multiselectfilter();
            
            this.images.on( 'reset', this.addAllImages, this );
            this.images.fetch({reset: true});
            
            this.flavors.on( 'reset', this.addAllFlavors, this );
            this.flavors.fetch({ data: $.param({ cred_id: this.credentialId, region: this.region }), reset:true });
            
            this.availabilityZones.on( 'reset', this.addAllAvailabilityZones, this );
            this.availabilityZones.fetch({ data: $.param({ cred_id: this.credentialId, region: this.region }), reset: true });
            
            this.keyPairs.on( 'reset', this.addAllKeyPairs, this );
            this.keyPairs.fetch({ data: $.param({ cred_id: this.credentialId, region: this.region }), reset: true });
            
            this.securityGroups.on( 'reset', this.addAllSecurityGroups, this );
            this.securityGroups.fetch({ data: $.param({ cred_id: this.credentialId, region: this.region }), reset: true });

            this.elasticityChange();
        },
        
        addAllImages: function() {
            var createView = this;
            $("#image_select").autocomplete({
                source: createView.images.toJSON(),
                minLength: 0
            })
            .data("autocomplete")._renderItem = function (ul, item){
                var imagePath;
                switch(item.logo)
                {
                case "aws":
                    imagePath = "/images/ImageLogos/amazon20.png";
                    break;
                case "redhat":
                    imagePath = "/images/ImageLogos/redhat20.png";
                    break;
                case "suse":
                    imagePath = "/images/ImageLogos/suse20.png";
                    break;
                case "ubuntu":
                    imagePath = "/images/ImageLogos/canonical20.gif";
                    break;
                case "windows":
                    imagePath = "/images/ImageLogos/windows20.png";
                    break;
                }
                var img = '<td style="width:22px;" rowspan="2"><img height="20" width="20" src="'+imagePath+'"/></td>';
                var name = '<td>'+item.label+'</td>';
                var description = '<td>'+item.description+'</td>';
                var imageItem = '<a><table stlye="min-width:150px;"><tr>'+ img + name + '</tr><tr>' + description + '</tr></table></a>';
                return $("<li>").data("item.autocomplete", item).append(imageItem).appendTo(ul);
            };
        },
        
        addAllAvailabilityZones: function() {
            $("#availability_zone_select").empty();
            this.availabilityZones.each(function(az) {
                $("#availability_zone_select").append($("<option></option>").text(az.attributes.zoneName));
            });
            $("#availability_zone_select").multiselect("refresh");
        },
        
        addAllFlavors: function() {
            $("#flavor_select").empty();
            this.flavors.each(function(flavor) {
                $("#flavor_select").append($("<option></option>").text(flavor.attributes.name));
            });
            $("#flavor_select").selectmenu();
        },
        
        addAllKeyPairs: function() {
            $("#key_pair_select").empty();
            this.keyPairs.each(function(keyPair) {
                $("#key_pair_select").append($("<option></option>").text(keyPair.attributes.name));
            });
            $("#key_pair_select").selectmenu();
        },
        
        addAllSecurityGroups: function() {
            $("#security_group_select").empty();
            this.securityGroups.each(function(sg) {
                if(sg.attributes.name) {
                    $("#security_group_select").append($("<option></option>").text(sg.attributes.name));
                }
            });
            $("#security_group_select").multiselect("refresh");
        },
        
        openImageList: function() {
            if($("ul.ui-autocomplete").is(":hidden")) {
                $("#image_select").autocomplete("search", "");
            }
        },
        
        elasticityChange: function () {
            switch($("input[name=elasticity]:checked").val())
            {
                case "auto_recovery":
                    $("#elasticity_image").attr("src", "/images/IconPNGs/Autorestart.png");
                    var autoRecoveryHTML = "<table>" +
                                                "<tr>" +
                                                    "<td>Min:</td><td>1</td>" +
                                                "</tr>" +
                                                "<tr>" +
                                                    "<td>Max:</td><td>1</td>" +
                                                "</tr>" +
                                                "<tr>" +
                                                    "<td>Desired Capacity:</td><td>1</td>" +
                                                "</tr>" +
                                            "</table>";
                    $("#elasticity_config").html(autoRecoveryHTML);
                    break;
                case "fixed_array":
                    $("#elasticity_image").attr("src", "/images/IconPNGs/Autoscale.png");
                    var fixedArrayHTML = "<table><tr><td>Number of Instances:</td><td><input id='fixed_array_size'/></td></tr></table>";
                    $("#elasticity_config").html(fixedArrayHTML);
                    break;
                case "autoscale":
                    $("#elasticity_image").attr("src", "/images/IconPNGs/Autoscale.png");
                    var autoScaleHTML = "<table>" +
                                            "<tr><td>Min:</td><td><input id='as_min'/></td></tr>" +
                                            "<tr><td>Max:</td><td><input id='as_max'/></td></tr>" +
                                            "<tr><td>Desired Capacity:</td><td><input id='as_desired_capacity'/></td></tr>" +
                                        "</table>" +
                                        "<div id='trigger_radio'>" +
                                            "<input type='radio' id='trigger_on' name='triggers' value='on'/><label for='trigger_on'>Trigger On</label>" +
                                            "<input type='radio' id='trigger_off' name='triggers' value='off' checked/><label for='trigger_off'>Trigger Off</label>" +
                                        "</div>" +
                                        "<br />" +
                                        "<div id='trigger_options' class='border_group'>" +
                                            "<table>" +
                                                "<tr>" +
                                                    "<td>Trigger Measurement:</td>" +
                                                    "<td>" +
                                                        "<select id='trigger_measurement_select' class='medium_width'>" +
                                                            "<option value='CPUUtilization'>CPU Utilization</option>" +
                                                            "<option value='NetworkIn'>Network In</option>" +
                                                            "<option value='NetworkOut'>Network Out</option>" +
                                                            "<option value='DiskWriteOps'>Disk Write Operations</option>" +
                                                            "<option value='DiskWriteBytes'>Disk Write Bytes</option>" +
                                                            "<option value='DiskReadOps'>Disk Read Operations</option>" +
                                                            "<option value='DiskReadBytes'>Disk Read Bytes</option>" +
                                                            "<option value='Latency'>Latency</option>" +
                                                            "<option value='RequestCount'>Request Count</option>" +
                                                            "<option value='HealthyHostCount'>Healthy Host Count</option>" +
                                                            "<option value='UnhealthyHostCount'>Unhealthy Host Count</option>" +
                                                        "</select>" +
                                                    "</td>" +
                                                "</tr>" +
                                                "<tr>" +
                                                    "<td>Trigger Statistic:</td>" +
                                                    "<td>" +
                                                        "<select id='trigger_statistic_select' class='medium_width'>" +
                                                            "<option value='Average'>Average</option>" +
                                                            "<option value='Minimum'>Minimum</option>" +
                                                            "<option value='Maximum'>Maximum</option>" +
                                                            "<option value='Sum'>Sum</option>" +
                                                        "</select>" +
                                                    "</td>" +
                                                "</tr>" +
                                                "<tr><td>Unit of Measurement:</td><td><span id='unit_of_measurement_output'>Percent</span></td></tr>" +
                                                "<tr>" +
                                                    "<td>Measure Period (minutes):</td>" +
                                                    "<td><input type='text' id='measure_period_input' class='small_width'/> <span>(1-600)</span></td>" +
                                                "</tr>" +
                                                "<tr>" +
                                                    "<td>Upper Threshold:</td>" +
                                                    "<td><input type='text' id='upper_threshold_input' class='small_width'/> <span id='upper_threshold_label'>(1-100)<span></td>" +
                                                "</tr>" +
                                                "<tr>" +
                                                    "<td>Upper Breach Scale Increment:</td>" +
                                                    "<td><input type='text' id='upper_scale_increment_input' class='small_width'/></td>" +
                                                "</tr>" +
                                                "<tr>" +
                                                    "<td>Lower Threshold:</td>" +
                                                    "<td><input type='text' id='lower_threshold_input' class='small_width'/> <span id='lower_threshold_label'>(1-100)<span></td>" +
                                                "</tr>" +
                                                "<tr>" +
                                                    "<td>Lower Breach Scale Increment:</td>" +
                                                    "<td><input type='text' id='lower_scale_increment_input' class='small_width'/></td>" +
                                                "</tr>" +
                                            "</table>" +
                                        "</div>";
                    $("#elasticity_config").html(autoScaleHTML);
                    $("#trigger_radio").buttonset();
                    this.triggerRadioToggle();
                    this.triggerMeasurementChange();
                    var createView = this;
                    $("#trigger_measurement_select").selectmenu({
                        change: function() {
                            createView.triggerMeasurementChange();
                        }
                    });
                    $("#trigger_statistic_select").selectmenu();
                    $("#measure_period_input").val("5");
                    $("#upper_scale_increment_input").val("1");
                    $("#lower_scale_increment_input").val("-1");
                    break;
            }
        },

        triggerRadioToggle: function() {
            if($("#trigger_on").is(":checked")) {
                $("#trigger_options").removeClass("ui-state-disabled");
                $("#trigger_measurement_select").removeAttr("disabled");
                $("#trigger_measurement_select").selectmenu();
                $("#trigger_statistic_select").removeAttr("disabled");
                $("#trigger_statistic_select").selectmenu();
                $("#measure_period_input").removeAttr("disabled");
                $("#upper_threshold_input").removeAttr("disabled");
                $("#upper_scale_increment_input").removeAttr("disabled");
                $("#lower_threshold_input").removeAttr("disabled");
                $("#lower_scale_increment_input").removeAttr("disabled");
            }else {
                $("#trigger_options").addClass("ui-state-disabled");
                $("#trigger_measurement_select").attr("disabled", true);
                $("#trigger_measurement_select").selectmenu();
                $("#trigger_statistic_select").attr("disabled", true);
                $("#trigger_statistic_select").selectmenu();
                $("#measure_period_input").attr("disabled", true);
                $("#upper_threshold_input").attr("disabled", true);
                $("#upper_scale_increment_input").attr("disabled", true);
                $("#lower_threshold_input").attr("disabled", true);
                $("#lower_scale_increment_input").attr("disabled", true);
            }
        },

        triggerMeasurementChange: function () {
            switch($("#trigger_measurement_select").val())
            {
                case "CPUUtilization":
                    $("#unit_of_measurement_output").html("Percent");
                    $("#upper_threshold_label, #lower_threshold_label").html("(1-100)");
                    $("#upper_threshold_input").val("80");
                    $("#lower_threshold_input").val("20");
                    break;
                case "NetworkIn":
                case "NetworkOut":
                case "DiskWriteBytes":
                case "DiskReadBytes":
                    $("#unit_of_measurement_output").html("Bytes");
                    $("#upper_threshold_label, #lower_threshold_label").html("(0-20000000)");
                    $("#upper_threshold_input").val("6000000");
                    $("#lower_threshold_input").val("2000000");
                    break;
                case "DiskWriteOps":
                case "DiskReadOps":
                case "RequestCount":
                case "HealthyHostCount":
                case "UnhealthyHostCount":
                    $("#unit_of_measurement_output").html("Count");
                    $("#upper_threshold_label, #lower_threshold_label").html("(0-20000000)");
                    $("#upper_threshold_input").val("6000000");
                    $("#lower_threshold_input").val("2000000");
                    break;
                case "Latency":
                    $("#unit_of_measurement_output").html("Seconds");
                    $("#upper_threshold_label, #lower_threshold_label").html("(0-20000000)");
                    $("#upper_threshold_input").val("60");
                    $("#lower_threshold_input").val("10");
                    break;
            }
        },

        displayValid: function(valid, selector) {
            if(valid) {
                $(selector).css("border-color", "");
            }else{
                $(selector).css("border-color", "#FF0000");
            }
        },
        
        create: function() {
            var createView = this;
            var newAutoscaleGroup = this.autoscaleGroup;
            var launch_config_options = {};
            var autoscale_group_options = {};
            var issue = false;
            if($("#autoscale_group_name").val() === "") {
                this.displayValid(false, "#autoscale_group_name");
            }else {
                this.displayValid(true, "#autoscale_group_name");
                autoscale_group_options["AutoScalingGroupName"] = $("#autoscale_group_name").val();
                autoscale_group_options["LaunchConfigurationName"] = $("#autoscale_group_name").val() + "-lc";
                launch_config_options.id = $("#autoscale_group_name").val() + "-lc";
            }
            $.each(this.images.toJSON(), function(index, image) {
                if(image.label === $("#image_select").val()) {
                    launch_config_options.image_id = image.region[createView.region];
                }
            });
            if(launch_config_options.image_id) {
                this.displayValid(true, "#image_select");
            }else {
                issue = true;
                this.displayValid(false, "#image_select");
            }
            this.flavors.each(function(flavor) {
                if(flavor.attributes.name === $("#flavor_select").val()) {
                    launch_config_options.instance_type = flavor.attributes.id;
                } 
            });
            launch_config_options["KeyName"] = $("#key_pair_select").val();
            if($("#security_group_select").val()) {
                launch_config_options["SecurityGroups"] = $("#security_group_select").val();
            }else {
                launch_config_options["SecurityGroups"] = [];
            }
            if($("#availability_zone_select").val()) {
                $("#az_select_message").html("");
                autoscale_group_options["AvailabilityZones"] = $("#availability_zone_select").val();
            }else {
                issue = true;
                $("#az_select_alert").html("Required");
            }
            switch($("input[name=elasticity]:checked").val())
            {
                case "auto_recovery":
                    autoscale_group_options["MaxSize"]= 1;
                    autoscale_group_options["MinSize"] = 1;
                    autoscale_group_options["DesiredCapacity"] = 1;
                    break;
                case "fixed_array":
                    autoscale_group_options["MaxSize"] = parseInt($("#fixed_array_size").val(), 10);
                    autoscale_group_options["MinSize"] = parseInt($("#fixed_array_size").val(), 10);
                    autoscale_group_options["DesiredCapacity"] = parseInt($("#fixed_array_size").val(), 10);
                    break;
                case "autoscale":
                    autoscale_group_options["MaxSize"] = parseInt($("#as_max").val(), 10);
                    autoscale_group_options["MinSize"] = parseInt($("#as_min").val(), 10);
                    if($("#as_desired_capacity").val() !== "") {
                        autoscale_group_options["DesiredCapacity"] = parseInt($("#as_desired_capacity").val(), 10);
                    }else {
                        autoscale_group_options["DesiredCapacity"] = parseInt($("#as_min").val(), 10);
                    }
                    break;
            }
            launch_config_options["InstanceMonitoring.Enabled"] = $("#detailed_monitoring").is(":checked");
            var trigger_options;
            if($("input[name=elasticity]:checked").val() === "autoscale" && $("#trigger_on").is(":checked")) {
                trigger_options = {
                    "trigger_measurement": $("#trigger_measurement_select").val(),
                    "statistic": $("#trigger_statistic_select").val(),
                    "unit": $("#unit_of_measurement_output").html(),
                    "measure_period": parseInt($("#measure_period_input").val(), 10) * 60,
                    "upper_threshold": parseInt($("#upper_threshold_input").val(), 10),
                    "scale_increment": parseInt($("#upper_scale_increment_input").val(), 10),
                    "lower_threshold": parseInt($("#lower_threshold_input").val(), 10),
                    "scale_decrement": parseInt($("#lower_scale_increment_input").val(), 10)
                };
            }

            if(!issue) {
                newAutoscaleGroup.create(launch_config_options, autoscale_group_options, trigger_options, this.credentialId, this.region);
                this.$el.dialog('close');
            } 
        }
    });
    
    return AutoscaleGroupCreateView;
});
