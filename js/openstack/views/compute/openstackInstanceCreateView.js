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
        'jquery.multiselect.filter',
        'backbone.stickit'
], function( $, _, Backbone, DialogView, instanceCreateTemplate, Instance, Instances, Images, AvailabilityZones, Flavors, KeyPairs, SecurityGroups, ich, Common ) {

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
        flavors: new Flavors(),
        keyPairs: new KeyPairs(),
        securityGroups: new SecurityGroups(),
        collectionsCount: 3,
        
        model: new Instance({collection: new Instances()}),
        
        /** @type {Object} Event listeners for new Openstack instance dialog */
        events: {
            "focus #image_select": "openImageList",
            "dialogclose": "close"
        },

        /**
         *    backbone.stickit bindings to map selectors to model attributes
         *    NOTE: 'this' has scope of view in selectOptions
         *    @type {Object}
         *
         *
         *
         */
        bindings: {
            '#instance_name': 'name',
            'select#key_pair_select': {
                observe: 'key_name',
                selectOptions: {
                    collection: function() {
                        return this.keyPairs;
                    },
                    valuePath: 'name',
                    labelPath: 'name',
                    defaultOption: {
                        label: 'Choose Key',
                        value: null
                    }
                }
            },
            'select#flavor_select': {
                observe: 'flavor_ref',
                selectOptions: {
                    collection: function() {
                        return this.flavors;
                    },
                    labelPath: 'name',
                    valuePath: 'id',
                    defaultOption: {
                        label: 'Choose Size',
                        value: null
                    }
                }
            },
            'select#security_group_select': {
                observe: 'groups',
                selectOptions: {
                    collection: function() {
                        return this.securityGroups;
                    },
                    labelPath: 'name',
                    valuePath: 'name'
                },
                selectedList: 3,
                noneSelectedText: "Select Security Group(s)"
            }
        },

        /**
         * [initialize description]
         * Initializes new Openstack CreateInstance view dialog
         * @param  {Hash} options
         * @return {nil}
         */
        initialize: function(options) {
            this.credentialId = options.cred_id;
            this.region = options.region;
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
            
            this.images.on( 'reset', this.addAllImages, this );
            this.images.fetch({reset: true});
            
            this.flavors.on( 'reset', this.applyBindings, this );
            this.flavors.fetch({ data: $.param({ cred_id: this.credentialId}), reset: true });
            
            this.keyPairs.on( 'reset', this.applyBindings, this );
            this.keyPairs.fetch({ data: $.param({ cred_id: this.credentialId}), reset: true });
            
            this.securityGroups.on( 'reset', this.applyBindings, this );
            this.securityGroups.fetch({ data: $.param({ cred_id: this.credentialId}), reset: true });

            
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

        applyBindings: function() {
            this.respondedCount = this.respondedCount ? this.respondedCount + 1 : 1;
            if(this.respondedCount === this.collectionsCount)
            {
                this.stickit();
            }
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
            this.model.create(this.credentialId);
            this.$el.dialog('close');
        }

    });
    
    return InstanceCreateView;
});
