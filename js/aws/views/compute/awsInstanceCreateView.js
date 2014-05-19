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
        'text!templates/aws/compute/awsInstanceCreateTemplate.html',
        'aws/models/compute/awsInstance',
        'aws/collections/compute/awsImages',
        'aws/collections/compute/awsAvailabilityZones',
        'aws/collections/compute/awsFlavors',
        'aws/collections/compute/awsKeyPairs',
        'aws/collections/compute/awsSecurityGroups',
        'common',
        'jquery.multiselect',
        'jquery.multiselect.filter'
        
], function( $, _, Backbone, DialogView, instanceCreateTemplate, Instance, Images, AvailabilityZones, Flavors, KeyPairs, SecurityGroups, Common ) {
    
    /**
     * InstanceCreateView is UI form to create compute.
     *
     * @name InstanceCreateView
     * @constructor
     * @category Compute
     * @param {Object} initialization object.
     * @returns {Object} Returns a ComputeCreateView instance.
     */
    
    var InstanceCreateView = DialogView.extend({

        template: _.template(instanceCreateTemplate),

        credentialId: undefined,

        region: undefined,
        
        images: new Images(),
        
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
            this.region = options.region;
        },

        render: function() {
            var createView = this;
            this.$el.html(this.template);

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
            $("#security_group_select").multiselect({
                selectedList: 3,
                noneSelectedText: "Select Security Group(s)"
            }).multiselectfilter();
            
            if(JSON.parse(sessionStorage.group_policies).length > 0){
                this.addPolicyImages(JSON.parse(sessionStorage.group_policies));
            }
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
                case "centos":
                    imagePath = "/images/ImageLogos/centos.gif";
                    break;
                case "fedora":
                    imagePath = "/images/ImageLogos/fedora36.png";
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
            $("#az_select").empty();
            this.availabilityZones.each(function(az) {
                $("#az_select").append($("<option></option>").text(az.attributes.zoneName));
            });
        },
        
        addAllFlavors: function() {
            $("#flavor_select").empty();
            this.flavors.each(function(flavor) {
                $("#flavor_select").append($("<option></option>").text(flavor.attributes.name));
            });
        },
        
        addAllKeyPairs: function() {
            $("#key_pair_select").empty();
            this.keyPairs.each(function(keyPair) {
                $("#key_pair_select").append($("<option></option>").text(keyPair.attributes.name));
            });
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
                var noneHTML = "";
                $("#elasticity_config").html(noneHTML);
                break;
            case "autoRecovery":
                console.log("auto recover selected");
                $("#elasticity_image").attr("src", "/images/IconPNGs/Autorestart.png");
                var autoRecoveryHTML = "";
                $("#elasticity_config").html(autoRecoveryHTML);
                break;
            case "fixedArray":
                console.log("fixed array selected");
                $("#elasticity_image").attr("src", "/images/IconPNGs/Autoscale.png");
                var fixedArrayHTML = "<table><tr><td>Size:</td><td><input id='fixedArraySize'/></td></tr></table>";
                $("#elasticity_config").html(fixedArrayHTML);
                break;
            case "autoScale":
                console.log("auto scale selected");
                $("#elasticity_image").attr("src", "/images/IconPNGs/Autoscale.png");
                var autoScaleHTML = "<table>" +
                        "<tr><td>Min:</td><td><input id='asMin'/></td></tr>" +
                        "<tr><td>Max:</td><td><input id='asMax'/></td></tr>" +
                        "<tr><td>Desired Capacity:</td><td><input id='asDesiredCapacity'/></td></tr>" +
                        "</table>";
                $("#elasticity_config").html(autoScaleHTML);
                break;
            }
        },
        
        addPolicyImages: function(gps){
            //debugger
            for(var i in gps){
                var imgz = gps[i].group_policy.aws_governance.default_images;
                for(var j in imgz){
                    $("#image_select_default").append("<option value='"+imgz[j].name+"'>"+imgz[j].id+"</option>");
                }
            }
        },
        
        create: function() {
            var createView = this;
            var newInstance = this.instance;
            var options = {};
            console.log("create_initiated");
            //#TODO: Validate before create
            if($("#instance_name").val() !== "") {
                options.tags = {"Name": $("#instance_name").val()};
            }
 
            $.each(this.images.toJSON(), function(index, image) {
                if(image.label === $("#image_select").val()) {
                    options.image_id = image.region[createView.region];
                }
            });
            
            if($("#image_select").val() === ""){
                options.image_id = $("#image_select_default").val();
            }
            
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
            options.user_data = $("#user_data").val();
            newInstance.create(options, this.credentialId, this.region);
            this.$el.dialog('close');
        }

    });
    
    return InstanceCreateView;
});
