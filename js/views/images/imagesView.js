/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true requirejs:true require:true alert:true*/
define([
        'jquery',
        'underscore',
        'bootstrap',
        'backbone',
        'common',
        'text!templates/images/imagesTemplate.html',
        'collections/packedImages',
        'models/packedImage'
], function( $, _, bootstrap, Backbone, Common, imagesTemplate, PackedImages, PackedImage ) {

    var ImagesView = Backbone.View.extend({

        tagName: 'div',

        template: _.template(imagesTemplate),

        model: undefined,
        
        collection: undefined,

        events: {
            "click #new_image_template_button": "newImageTemplate",
            "click #close_image_template_button": "closeImageTemplate"
        },

        initialize: function() {
            $("#main").html(this.el);
            //this.$el.html(this.template);
        },

        render: function() {
            
            var $this = this;
            this.collection = new PackedImages()
            this.collection.fetch({
                success: function(collection){
                    $this.$el.html($this.template({templates: ['one','two'],
                                                   builders: collection.models[0].attributes,
                                                   }));
                }
            });
            //Fetch image templates
            this.renderTemplate();
        },
        
        renderTemplate: function(){
            if(this.model) {
                if(this.model.id === "") {
                    // Set image template fields to defaults
                }else {
                    this.$el.html(this.template({templates: ['one','two'],
                                                 builders: this.collection.models[0].attributes,
                                                 template: this.model}));
                    // Fill in the image template fields to match the selected image template
                }
                $("#image_template_not_opened").hide();
                $("#image_template_open").show();
            }else {
                //this.$el.html(this.template({collection: this.collection}));
                $("#image_template_open").hide();
                $("#image_template_not_opened").show();
            }
        },

        newImageTemplate: function() {
            if(this.model) {
                var confirmation = confirm("Are you sure you want to open a new image template? Any unsaved changes to the current template will be lose.");
                if(confirmation === true) {
                    this.model = "test";
                    this.renderTemplate();
                }
            }else {
                this.model = "test";
                this.renderTemplate();
            }
        },

        closeImageTemplate: function() {
            this.model = undefined;
            this.render();
        },

        close: function(){
            this.$el.empty();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
        }
    });

    var imagesView;

    Common.router.on('route:images', function () {
        if(sessionStorage.account_id) {
            if (this.previousView !== imagesView) {
                this.unloadPreviousState();
                imagesView = new ImagesView();
                this.setPreviousState(imagesView);
            }
            imagesView.render();
        }else {
            Common.router.navigate("", {trigger: true});
            Common.errorDialog("Login Error", "You must login.");
        }
    }, Common);

	return ImagesView;
});
