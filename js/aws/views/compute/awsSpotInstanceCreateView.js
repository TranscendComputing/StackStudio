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
        'text!templates/aws/compute/awsSpotInstanceCreateTemplate.html',
        '/js/aws/models/compute/awsSpotInstanceRequest.js',
        '/js/aws/models/compute/awsSpotPrice.js',
        '/js/aws/collections/compute/awsImages.js',
        '/js/aws/collections/compute/awsAvailabilityZones.js',
        '/js/aws/collections/compute/awsFlavors.js',
        '/js/aws/collections/compute/awsKeyPairs.js',
        '/js/aws/collections/compute/awsSecurityGroups.js',
        'icanhaz',
        'common',
        'jquery.ui.selectmenu',
        'jquery.multiselect',
        'jquery.multiselect.filter'
        
], function( $, _, Backbone, DialogView, spotInstanceCreateTemplate, Spotinstance, SpotPrice, Images, AvailabilityZones, Flavors, KeyPairs, SecurityGroups, ich, Common ) {

    /**
     * SpotInstanceCreateView is UI form to create compute.
     *
     * @name SpotInstanceCreateView
     * @constructor
     * @category Compute
     * @param {Object} initialization object.
     * @returns {Object} Returns a SpotInstanceCreateView instance.
     */
    
    var SpotInstanceCreateView = DialogView.extend({
        
        credentialId: undefined,
        
        images: new Images(),
        
        availabilityZones: new AvailabilityZones(),

        flavors: new Flavors(),
        
        keyPairs: new KeyPairs(),
        
        securityGroups: new SecurityGroups(),
        
        spotInstance: new Spotinstance(),
        
        currentPrice: new SpotPrice(),
        
        // Delegated events for creating new instances, etc.
        events: {
            "focus #image_select": "openImageList",
            "dialogclose": "close"
        },

        initialize: function(options) {
            this.credentialId = options.cred_id;
            var createView = this;
            var compiledTemplate = _.template(spotInstanceCreateTemplate);
            this.$el.html(compiledTemplate);

            this.$el.dialog({
                autoOpen: true,
                title: "Create Spot Instance",
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
            Common.vent.on( 'currentPriceRefresh', this.refreshMaxPrice, this);
            $("input[name=valid_from_group]").change(function () {
                createView.validFromChanged();
            });
            createView.validFromChanged();
            $("input[name=valid_until_group]").change(function () {
                createView.validUntilChanged();
            });
            createView.validUntilChanged();
            this.setValidTime();
            $("#accordion").accordion();
            $("#radio").buttonset();  
            $("#az_select").selectmenu({
                change: function() {
                    createView.getCurrentPrice();
                }
            });
            $("#flavor_select").selectmenu({
                change: function() {
                    createView.getCurrentPrice();
                }
            });
            $("#key_pair_select").selectmenu();
            $("#shutdown_behavior_select").selectmenu();
            $("#security_group_select").multiselect({
                selectedList: 3,
                noneSelectedText: "Select Security Group(s)"
            }).multiselectfilter();
            
            this.images.on( 'reset', this.addAllImages, this );
            this.images.fetch();
            
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
        
        addAllImages: function() {
            var createView = this;
            $("#image_select").autocomplete({
                source: createView.images.toJSON(),
                minLength: 0,
                select: function(event, ui) {
                    $("#image_select").val(ui.item.label);
                    createView.getCurrentPrice();
                }
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
            $("#image_select").blur();
        },
        
        addAllAvailabilityZones: function() {
            $("#az_select").empty();
            this.availabilityZones.each(function(az) {
                $("#az_select").append($("<option></option>").text(az.attributes.zoneName));
            });
            var createView = this;
            $("#az_select").selectmenu({
                change: function() {
                    createView.getCurrentPrice();
                }
            });
            this.getCurrentPrice();
        },
        
        addAllFlavors: function() {
            var createView = this;
            $("#flavor_select").empty();
            this.flavors.each(function(flavor) {
                $("#flavor_select").append($("<option></option>").text(flavor.attributes.name));
            });
            $("#flavor_select").selectmenu({
                change: function() {
                    createView.getCurrentPrice();
                }
            });
            this.getCurrentPrice();
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
        
        getCurrentPrice: function() {
            if($("#image_select").val() !== "" && $("#az_select").val() !== null && $("#flavor_select").val() !== null) {
                this.currentPrice = new SpotPrice();
                var flavorId, productType;
                
                this.flavors.each(function(flavor) {
                    if(flavor.attributes.name === $("#flavor_select").val()) {
                        flavorId = flavor.attributes.id;
                    }
                 });
                
                $.each(this.images.toJSON(), function(index, image) {
                    if(image.label === $("#image_select").val()) { 
                        productType = image.product;
                    }
                });

                if(flavorId && productType) {
                    this.currentPrice.currentPrice({"availability-zone": $("#az_select").val(), "instance-type": flavorId, "product-description": productType}, this.credentialId);
                }
            }
        },
        
        refreshMaxPrice: function() {
            var createView = this;
            $("#current_price").text("$ " + createView.currentPrice.attributes.spotPrice);
        },
        
        setValidTime: function() {
            var newDate = new Date();
            $("#valid_from_year").val(newDate.getUTCFullYear());
            $("#valid_from_month").val(newDate.getUTCMonth()+1);
            $("#valid_from_day").val(newDate.getUTCDate());
            $("#valid_from_hour").val(newDate.getUTCHours());
            $("#valid_from_minute").val(newDate.getUTCMinutes());
            
            $("#valid_until_year").val(newDate.getUTCFullYear());
            $("#valid_until_month").val(newDate.getUTCMonth()+1);
            $("#valid_until_day").val(newDate.getUTCDate());
            $("#valid_until_hour").val(newDate.getUTCHours());
            $("#valid_until_minute").val(newDate.getUTCMinutes());
        },
        
        validFromChanged: function() {
            if($("#valid_from_anytime").is(":checked")) {
                $("#valid_from_date").addClass("ui-state-disabled");
            }else {
                $("#valid_from_date").removeClass();
            }
        },
        
        validUntilChanged: function() {
            if($("#valid_until_anytime").is(":checked")) {
                $("#valid_until_date").addClass("ui-state-disabled");
            }else {
                $("#valid_until_date").removeClass();
            }
        },
        
        close: function() {
            console.log("close initiated");
            $("#accordion").remove();
            $("#image_combo_box").remove();
            $("#az_select").remove();
            $("#size_select").remove();
            $("#key_pair_select").remove();
            $("#security_group_select").remove();
            this.$el.dialog('close');
        },
        
        cancel: function() {
            this.$el.dialog('close');
        },
        
        create: function() {
            var newSpotInstance = this.spotInstance;
            var options = {};
            console.log("create_initiated");
            //#TODO: Validate before create
            //Hack alert, region is currently hardcoded to us-east-1
            var region = "us-east-1";
            $.each(this.images.toJSON(), function(index, image) {
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
            options.price = $("#max_price").val();
            options.monitoring = $("#detailed_monitoring").is(":checked");
            
            if($("#launch_group").val() !== "") {
                options.launch_group = $("#launch_group").val();
            }
            
            if(! $("#valid_from_anytime").is(":checked")) {
                options.valid_from = new Date($("#valid_from_year").val(), $("#valid_from_month").val(), $("#valid_from_day").val(), $("#valid_from_hour").val(), $("#valid_from_minute").val());
            }
            
            if(! $("#valid_until_anytime").is(":checked")) {
                options.valid_until = new Date($("#valid_until_year").val(), $("#valid_until_month").val(), $("#valid_until_day").val(), $("#valid_until_hour").val(), $("#valid_until_minute").val());
            }
            
            if($("#persistent_request").is(":checked")) {
                options.request_type = "persistent";
            }
            newSpotInstance.create(options, this.credentialId);
            
            this.$el.dialog('close');
        }

    });

    console.log("aws spot instance create view defined");
    
    return SpotInstanceCreateView;
});
