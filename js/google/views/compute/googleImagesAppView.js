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
        'views/resource/resourceAppView',
        'text!templates/google/compute/googleImageAppTemplate.html',
        'google/models/compute/googleImage',
        'google/collections/compute/googleImages',
        'google/views/compute/googleImageCreateView',
        'text!templates/emptyGraphTemplate.html',
        'icanhaz',
        'common',
        'morris',
        'spinner',
        'jquery.dataTables'
], function( $, _, Backbone, ResourceAppView, googleImageAppTemplate, Image, Images, GoogleImageCreate, emptyGraph, ich, Common, Morris, Spinner ) {
    'use strict';

    // Google Instance Application View
    // ------------------------------

    /**
     * GoogleImagesAppView is UI view list of cloud instances.
     *
     * @name InstanceAppView
     * @constructor
     * @category Resources
     * @param {Object} initialization object.
     * @returns {Object} Returns a GoogleImagesAppView instance.
     */
    var GoogleImagesAppView = ResourceAppView.extend({
        
        template: _.template(googleImageAppTemplate),

        emptyGraphTemplate: _.template(emptyGraph),
        
        modelStringIdentifier: "id",
        
        columns: ["name", "id","description", "creation_timestamp","status"],
        
        idColumnNumber: 1,
        
        model: Image,
        
        collectionType: Images,
        
        type: "compute",
        
        subtype: "images",
        
        CreateView: GoogleImageCreate,
        
        events: {
            'click .create_button': 'createNew',
            'click #action_menu ul li': 'performAction',
            'click #resource_table tr': "clickOne"
        },

        initialize: function(options) {
            if(options.cred_id) {
                this.credentialId = options.cred_id;
            }
            if(options.region) {
                this.region = options.region;
            }
            this.render();
            
            var instanceApp = this;
            Common.vent.on("imageAppRefresh", function() {
                instanceApp.render();
            });
        },
        
        toggleActions: function(e) {
            //Disable any needed actions
        },
        
        performAction: function(event) {
            var image = this.collection.get(this.selectedId);
            switch(event.target.text)
            {
            case "Delete":
                image.delete(this.credentialId, this.region);
                break;
            }
        },
        
        createNew : function () {
            var CreateView = this.CreateView;
            if(this.region) {
                this.newResourceDialog = new CreateView({cred_id: this.credentialId, region: this.region, kernels: this.getKernels()});
            }else {
                this.newResourceDialog = new CreateView({cred_id: this.credentialId, kernels: this.getKernels()});
            }
            this.newResourceDialog.render();
        },
        
        getKernels : function(){
            var kernels = []
            this.collection.each(function(model){
                if(!model.attributes.deprecated){
                    var kernel_list = model.attributes.preferred_kernel.split('/');
                    kernels.push(kernel_list[kernel_list.length-1]);
                }
            }, this);
            return kernels;
        }
    });

    return GoogleImagesAppView;
});
