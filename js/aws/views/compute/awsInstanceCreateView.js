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
        'text!templates/aws/compute/awsInstanceCreateTemplate.html',
        '/js/aws/models/compute/awsInstance.js',
        '/js/aws/collections/compute/awsAvailabilityZones.js',
        '/js/aws/collections/compute/awsFlavors.js',
        '/js/aws/collections/compute/awsKeyPairs.js',
        '/js/aws/collections/compute/awsSecurityGroups.js',
        'icanhaz',
        'common',
        'jquery.ui.selectmenu',
        'jquery.multiselect',
        'jquery.multiselect.filter'
        
], function( $, _, Backbone, instanceCreateTemplate, Instance, AvailabilityZones, Flavors, KeyPairs, SecurityGroups, ich, Common ) {
    
    /**
     * InstanceCreateView is UI form to create compute.
     *
     * @name InstanceCreateView
     * @constructor
     * @category Compute
     * @param {Object} initialization object.
     * @returns {Object} Returns a ComputeCreateView instance.
     */
    
    var InstanceCreateView = Backbone.View.extend({
        
        tagName: "div",
        
        credentialId: undefined,
        
        images: [   {
                        label: "Amazon Linux AMI 64-bit",
                        description: "EBS-backed. It includes Linux 3.2, AWS tools, and repository access to multiple versions of MySQL, PostgreSQL, Python, Ruby, and Tomcat.",
                        logo: "aws",
                        region: {
                            "us-east-1": "ami-1624987f",
                            "us-west-1": "ami-1bf9de5e",
                            "us-west-2": "ami-2a31bf1a",
                            "eu-west-1": "ami-c37474b7",
                            "ap-southeast-1": "ami-a6a7e7f4",
                            "ap-southeast-2": "ami-bd990e87",
                            "ap-northeast-1": "ami-4e6cd34f",
                            "sa-east-1": "ami-1e08d103"
                    }
                    },
                    {
                        label: "Amazon Linux AMI 32-bit",
                        description: "EBS-backed. It includes Linux 3.2, AWS tools, and repository access to multiple versions of MySQL, PostgreSQL, Python, Ruby, and Tomcat.",
                        logo: "aws",
                        region: {
                            "us-east-1": "ami-1a249873",
                            "us-west-1": "ami-19f9de5c",
                            "us-west-2": "ami-2231bf12",
                            "eu-west-1": "ami-937474e7",
                            "ap-southeast-1": "ami-a2a7e7f0",
                            "ap-southeast-2": "ami-b3990e89",
                            "ap-northeast-1": "ami-486cd349",
                            "sa-east-1": "ami-e209d0ff"
                        }
                    },
                    {
                        label: "Red Hat Enterprise Linux 6.3 64-bit",
                        description: "Red Hat Enterprise Linux version 6.3, EBS-boot.",
                        logo: "redhat",
                        region: {
                            "us-east-1": "ami-cc5af9a5",
                            "us-west-1": "ami-51f4ae14",
                            "us-west-2": "ami-8a25a9ba",
                            "eu-west-1": "ami-8bf2f7ff",
                            "ap-southeast-1": "ami-24e5a376",
                            "ap-southeast-2": "ami-8d8413b7",
                            "ap-northeast-1": "ami-5453e055",
                            "sa-east-1": "ami-4807d955"
                        }
                    },
                    {
                        label: "Red Hat Enterprise Linux 6.3 32-bit",
                        description: "Red Hat Enterprise Linux version 6.3, EBS-boot.",
                        logo: "redhat",
                        region: {
                            "us-east-1": "ami-d258fbbb",
                            "us-west-1": "ami-53f4ae16",
                            "us-west-2": "ami-8625a9b6",
                            "eu-west-1": "ami-8ff2f7fb",
                            "ap-southeast-1": "ami-a0e4a2f2",
                            "ap-southeast-2": "ami-71891e4b",
                            "ap-northeast-1": "ami-4e53e04f",
                            "sa-east-1": "AMI ID ami-4e07d953"
                        }
                    },
                    {
                        label: "Ubuntu Server 12.04.1 LTS 64-bit",
                        description: "Ubuntu Server 12.04.1 LTS with support available from Canonical.",
                        logo: "ubuntu",
                        region: {
                            "us-east-1": "ami-3fec7956",
                            "us-west-1": "ami-883714cd",
                            "us-west-2": "ami-2a31bf1a",
                            "eu-west-1": "ami-f2191786",
                            "ap-southeast-1": "ami-56e6a404",
                            "ap-southeast-2": "ami-e2ba2cd8",
                            "ap-northeast-1": "ami-9763e696",
                            "sa-east-1": "ami-d56ab2c8"
                        }
                    },
                    {
                        label: "Ubuntu Server 12.04.1 LTS 32-bit",
                        description: "Ubuntu Server 12.04.1 LTS with support available from Canonical.",
                        logo: "ubuntu",
                        region: {
                            "us-east-1": "ami-3bec7952",
                            "us-west-1": "ami-8e3714cb",
                            "us-west-2": "ami-48c94378",
                            "eu-west-1": "ami-f0191784",
                            "ap-southeast-1": "ami-50e6a402",
                            "ap-southeast-2": "ami-ecba2cd6",
                            "ap-northeast-1": "ami-9563e694",
                            "sa-east-1": "ami-db6ab2c6"
                        }
                    },
                ],
        
        availabilityZones: new AvailabilityZones(),

        flavors: new Flavors(),
        
        keyPairs: new KeyPairs(),
        
        securityGroups: new SecurityGroups(),
        
        instance: new Instance(),
        
        // Delegated events for creating new instances, etc.
        events: {
            "focus #image_select": "openImageList",
            "dialogclose": "close",
            "change #radio": "elasticityChange"
        },

        initialize: function(options) {
            this.credentialId = options.cred_id;
            var createView = this;
            var compiledTemplate = _.template(instanceCreateTemplate);
            this.$el.html(compiledTemplate);

            this.$el.dialog({
                autoOpen: true,
                title: "Create Instance",
                width:575,
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
            $("#accordion").accordion();
            $("#radio").buttonset();
            
            $("#image_select").autocomplete({
                source: createView.images,
                minLength: 0,
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
            $("#az_select").selectmenu();
            $("#flavor_select").selectmenu();
            $("#key_pair_select").selectmenu();
            $("#shutdown_behavior_select").selectmenu();
            $("#security_group_select").multiselect({
                selectedList: 3,
                noneSelectedText: "Select Security Group(s)"
            }).multiselectfilter();
            
            this.flavors.on( 'reset', this.addAllFlavors, this );
            this.flavors.fetch({ data: $.param({ cred_id: this.credentialId}) });
            
            this.availabilityZones.on( 'reset', this.addAllAvailabilityZones, this );
            this.availabilityZones.fetch({ data: $.param({ cred_id: this.credentialId}) });
            
            this.keyPairs.on( 'reset', this.addAllKeyPairs, this );
            this.keyPairs.fetch({ data: $.param({ cred_id: this.credentialId}) });
            
            this.securityGroups.on( 'reset', this.addAllSecurityGroups, this );
            this.securityGroups.fetch({ data: $.param({ cred_id: this.credentialId}) });
        },

        render: function() {
            
        },
        
        addAllAvailabilityZones: function() {
            $("#az_select").empty();
            this.availabilityZones.each(function(az) {
                $("#az_select").append($("<option></option>").text(az.attributes.zoneName));
            });
            $("#az_select").selectmenu();
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
            switch($("input[name=radio]:checked").val())
            {
            case "none":
                console.log("none selected");
                $("#elasticity_image").attr("src", "/images/IconPNGs/NewServer.png");
                noneHTML = "";
                $("#elasticity_config").html(noneHTML);
                break;
            case "autoRecovery":
                console.log("auto recover selected");
                $("#elasticity_image").attr("src", "/images/IconPNGs/Autorestart.png");
                autoRecoveryHTML = "";
                $("#elasticity_config").html(autoRecoveryHTML);
                break;
            case "fixedArray":
                console.log("fixed array selected");
                $("#elasticity_image").attr("src", "/images/IconPNGs/Autoscale.png");
                fixedArrayHTML = "<table><tr><td>Size:</td><td><input id='fixedArraySize'/></td></tr></table>";
                $("#elasticity_config").html(fixedArrayHTML);
                break;
            case "autoScale":
                console.log("auto scale selected");
                $("#elasticity_image").attr("src", "/images/IconPNGs/Autoscale.png");
                autoScaleHTML = "<table>" +
                        "<tr><td>Min:</td><td><input id='asMin'/></td></tr>" +
                        "<tr><td>Max:</td><td><input id='asMax'/></td></tr>" +
                        "<tr><td>Desired Capacity:</td><td><input id='asDesiredCapacity'/></td></tr>" +
                        "</table>";
                $("#elasticity_config").html(autoScaleHTML);
                break;
            };
        },
        
        close: function() {
            console.log("close initiated");
            $("#accordion").remove();
            $("#image_select").remove();
            $("#az_select").remove();
            $("#flavor_select").remove();
            $("#key_pair_select").remove();
            $("#security_group_select").remove();
            $("#shutdown_behavior_select").remove();
        },
        
        cancel: function() {
            this.$el.dialog('close');
        },
        
        create: function() {
            var newInstance = this.instance;
            var options = {};
            console.log("create_initiated");
            //#TODO: Validate before create
            if($("#instance_name").val() !== "") {
                options.tags = {"Name": $("#instance_name").val()};
            }
            //Hack alert, region is currently hardcoded to us-east-1
            var region = "us-east-1";
            $.each(this.images, function(index, image) {
                if(image.label === $("#image_select").val()) {
                    options.image_id = image.region[region];
                }
            });
            
            this.flavors.each(function(flavor) {
                if(flavor.attributes.name === $("#flavor_select").val()) {
                    options.flavor_id = flavor.attributes.id;
                } 
             });
            
            options.availability_zone = $("#az_select").val();
            options.key_name = $("#key_pair_select").val();
            options.groups = $("#security_group_select").val();
            options.monitoring = $("#detailed_monitoring").is(":checked");
            options.instance_initiated_shutdown_behavior = $("#shutdown_behavior_select").val().toLowerCase();
            newInstance.create(options, this.credentialId);
            
            this.$el.dialog('close');
        }

    });

    console.log("aws instance create view defined");
    
    return InstanceCreateView;
});
