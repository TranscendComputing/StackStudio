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
        '/js/openstack/models/compute/openstackInstance.js',
        '/js/openstack/collections/compute/openstackImages.js',
        '/js/openstack/collections/compute/openstackAvailabilityZones.js',
        '/js/openstack/collections/compute/openstackFlavors.js',
        '/js/openstack/collections/compute/openstackKeyPairs.js',
        '/js/openstack/collections/compute/openstackSecurityGroups.js',
        'common',
        'jquery.multiselect',
        'jquery.multiselect.filter'
], function( $, _, Backbone, DialogView, instanceCreateTemplate, Instance, Images, AvailabilityZones, Flavors, KeyPairs, SecurityGroups, Common ) {
    
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
            $("#security_group_select").multiselect({
                selectedList: 3,
                noneSelectedText: "Select Security Group(s)"
            }).multiselectfilter();
            
            this.images.on( 'reset', this.addAllImages, this );
            this.images.fetch({data: $.param({ cred_id: this.credentialId, region: this.region }), reset: true});
            
            this.flavors.on( 'reset', this.addAllFlavors, this );
            this.flavors.fetch({ data: $.param({ cred_id: this.credentialId, region: this.region }), reset:true });

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
            }).data("autocomplete")._renderItem = function (ul, item) {
                item["label"] = item.name;
                item["value"] = item.name;
                var imageItem = "<a>"+item.name+"</a>";
                return $("<li>").data("item.autocomplete", item).append(imageItem).appendTo(ul);
            };
            /*
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
            */
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

        create: function() {
            var createView = this;
            var newInstance = this.instance;
            var options = {};
            //#TODO: Validate before create
            if($("#instance_name").val() !== "") {
                options.name = $("#instance_name").val();
            }
 
            $.each(this.images.toJSON(), function(index, image) {
                if(image.name === $("#image_select").val()) {
                    options.image_ref = image.id;
                }
            });
            
            this.flavors.each(function(flavor) {
                if(flavor.attributes.name === $("#flavor_select").val()) {
                    options.flavor_ref = flavor.attributes.id;
                } 
            });
            
            options.key_name = $("#key_pair_select").val();
            if($("#security_group_select").val()) {
                options.security_groups = $("#security_group_select").val();
            }
            newInstance.create(options, this.credentialId, this.region);
            this.$el.dialog('close');
        }
    });
    
    return InstanceCreateView;
});
