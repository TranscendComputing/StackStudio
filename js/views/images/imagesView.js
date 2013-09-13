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
        'text!templates/images/imagesTemplate.html'
], function( $, _, bootstrap, Backbone, Common, imagesTemplate ) {

    var ImagesView = Backbone.View.extend({

        tagName: 'div',

        template: _.template(imagesTemplate),

        currentImageTemplate: undefined,

        events: {
            "click #new_image_template_button": "newImageTemplate",
            "click #close_image_template_button": "closeImageTemplate"
        },

        initialize: function() {
            $("#main").html(this.el);
            this.$el.html(this.template);
        },

        render: function() {
            //Fetch image templates
            if(this.currentImageTemplate) {
                if(this.currentImageTemplate.id === "") {
                    // Set image template fields to defaults
                }else {
                    // Fill in the image template fields to match the selected image template
                }
                $("#image_template_not_opened").hide();
                $("#image_template_open").show();
            }else {
                $("#image_template_open").hide();
                $("#image_template_not_opened").show();
            }
        },

        newImageTemplate: function() {
            if(this.currentImageTemplate) {
                var confirmation = confirm("Are you sure you want to open a new image template? Any unsaved changes to the current template will be lose.");
                if(confirmation === true) {
                    this.currentImageTemplate = "test";
                    this.render();
                }
            }else {
                this.currentImageTemplate = "test";
                this.render();
            }
        },

        closeImageTemplate: function() {
            this.currentImageTemplate = undefined;
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
