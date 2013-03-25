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
        'text!templates/openstack/compute/openstackInstanceCreateTemplate.html',
        '/js/openstack/collections/compute/openstackInstances.js',
        '/js/openstack/collections/compute/openstackImages.js',
        '/js/openstack/collections/compute/openstackAvailabilityZones.js',
        '/js/openstack/collections/compute/openstackFlavors.js',
        '/js/openstack/collections/compute/openstackKeyPairs.js',
        '/js/openstack/collections/compute/openstackSecurityGroups.js',
        'icanhaz',
        'common',
        'jquery.ui.selectmenu',
        'jquery.multiselect',
        'jquery.multiselect.filter'
], function( $, _, Backbone, DialogView, instanceCreateTemplate, Instances, Images, AvailabilityZones, Flavors, KeyPairs, SecurityGroups, ich, Common ) {
    
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
        
        tagName: "div",
        
        credentialId: undefined,
        
        images: new Images(),
        
        availabilityZones: new AvailabilityZones(),

        flavors: new Flavors(),
        
        keyPairs: new KeyPairs(),
        
        securityGroups: new SecurityGroups(),
        
        collection: new Instances(),
        
        /** @type {Hash} Event listeners for new Openstack instance dialog */
        events: {
            "focus #image_select": "openImageList",
            "dialogclose": "close"
        },

        /**
         * [initialize description]
         * Initializes new Openstack CreateInstance view dialog
         * @param  {Hash} options
         * @return {nil}
         */
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
            $("#az_select").selectmenu();
            $("#flavor_select").selectmenu();
            $("#key_pair_select").selectmenu();
            $("#security_group_select").multiselect({
                selectedList: 3,
                noneSelectedText: "Select Security Group(s)"
            }).multiselectfilter();
            
            this.images.on( 'reset', this.addAllImages, this );
            this.images.fetch();
            
            this.flavors.on( 'reset', this.addAllFlavors, this );
            this.flavors.fetch({ data: $.param({ cred_id: this.credentialId}) });
            
            //this.availabilityZones.on( 'reset', this.addAllAvailabilityZones, this );
            //this.availabilityZones.fetch({ data: $.param({ cred_id: this.credentialId}) });
            
            this.keyPairs.on( 'reset', this.addAllKeyPairs, this );
            this.keyPairs.fetch({ data: $.param({ cred_id: this.credentialId}) });
            
            this.securityGroups.on( 'reset', this.addAllSecurityGroups, this );
            this.securityGroups.fetch({ data: $.param({ cred_id: this.credentialId}) });
        },

        render: function() {
            
        },
        
        /**
         * [addAllImages description]
         * Renders view for images drop down list
         */
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
        
        /**
         * [addAllAvailabilityZones description]
         * Renders view for availability zones drop down list
         */
        addAllAvailabilityZones: function() {
            $("#az_select").empty();
            this.availabilityZones.each(function(az) {
                $("#az_select").append($("<option></option>").text(az.attributes.zoneName));
            });
            $("#az_select").selectmenu();
        },
        
        /**
         * [addAllFlavors description]
         * Renders view for instance types drop down list
         */
        addAllFlavors: function() {
            $("#flavor_select").empty();
            this.flavors.each(function(flavor) {
                $("#flavor_select").append($("<option></option>").text(flavor.attributes.name));
            });
            $("#flavor_select").selectmenu();
        },
        
        /**
         * [addAllKeyPairs description]
         * Renders view for key pairs drop down list
         */
        addAllKeyPairs: function() {
            $("#key_pair_select").empty();
            this.keyPairs.each(function(keyPair) {
                $("#key_pair_select").append($("<option></option>").text(keyPair.attributes.name));
            });
            $("#key_pair_select").selectmenu();
        },
        
        /**
         * [addAllSecurityGroups description]
         * Renders view for security groups drop down list
         */
        addAllSecurityGroups: function() {
            $("#security_group_select").empty();
            this.securityGroups.each(function(sg) {
                if(sg.attributes.name) {
                    $("#security_group_select").append($("<option></option>").text(sg.attributes.name));
                }
            });
            $("#security_group_select").multiselect("refresh");
        },
        
        /**
         * [openImageList description]
         * Renders autocomplete list for images drop down
         * @return {nil}
         */
        openImageList: function() {
            if($("ul.ui-autocomplete").is(":hidden")) {
                $("#image_select").autocomplete("search", "");
            }
        },
        
        /**
         * [create description]
         * Evaluates dialog values for new instance and calls API layer to launch new instance
         * @return {nil}
         */
        create: function() {
            var options = {};
            //#TODO: Validate before create
            if($("#instance_name").val() !== "") {
                options.name = $("#instance_name").val();
            }
            //Hack alert, region is currently hardcoded to us-east-1
            var region = "us-east-1";
            $.each(this.images.toJSON(), function(index, image) {
                if(image.label === $("#image_select").val()) {
                    options.image_ref = image.region[region];
                }
            });
            
            this.flavors.each(function(flavor) {
                if(flavor.attributes.name === $("#flavor_select").val()) {
                    options.flavor_ref = flavor.attributes.id;
                } 
             });
            
            //options.availability_zone = $("#az_select").val();
            options.key_name = $("#key_pair_select").val();
            options.groups = $("#security_group_select").val();
            var newInstance = this.collection.create();
            newInstance.create(options, this.credentialId);
            
            this.$el.dialog('close');
        }

    });

    console.log("openstack instance create view defined");
    
    return InstanceCreateView;
});
