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
        'models/offering',
        'text!templates/offerings/offeringDesignViewTemplate.html'
], function( $, _, bootstrap, Backbone, Common, Offering, offeringDesignViewTemplate ) {

    var OfferingsView = Backbone.View.extend({

        tagName: 'div',

        template: _.template(offeringDesignViewTemplate),

        model: null,
        
        events: {
            "click button[data-action='save']": "saveOfferingClick",
            "click button[data-action='cancel']": "cancelOfferingEditClick",
            "click button[data-action='delete']": "deleteOfferingClick"
        },

        initialize: function() {
            
        },

        render: function(){
            var s = this.template({model: this.model});
            this.$el.html(s);
        },

        saveOffering: function(){
            var $this = this;
            this.model.save({
                success:function(){
                    $this.hideErrors();
                    this.trigger("offeringSaved");
                },
                error:function(model,errors){
                    $this.showErrors(errors);
                }
            });
        },

        deleteOffering: function(){
            var $this = this;
            this.model.destroy({
                success:function(){
                    $this.hideErrors();
                    this.trigger("offeringDeleted");
                },
                error:function(model,errors){
                    $this.showErrors(errors);
                }
            });
        },

        saveOfferingClick: function(evt){
            debugger;
            this.saveOffering();
        },
        
        cancelOfferingEditClick: function(evt){
            this.trigger("offeringEditCancelled");
        },
        
        deleteOfferingClick: function(evt){
            this.deleteOffering();
        },

        showSuccess: function(){
            //TODO: Show success message only if this object is still visible.
        },

        showErrors: function(errors){
            _.each(errors, function (error) {
                //TODO: Display error messages
            }, this);
        },

        hideErrors: function(){
            //TODO: Hide errors
        },
        
        close: function(){
            this.$el.empty();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
        }
    });

    var offeringsView;

    Common.router.on('route:offeringsEdit', function () {
        if(sessionStorage.account_id) {
            if (this.previousView !== offeringsView) {
                this.unloadPreviousState();
                offeringsView = new OfferingsView();
                this.setPreviousState(offeringsView);
            }
            offeringsView.render();
        }else {
            Common.router.navigate("", {trigger: true});
            Common.errorDialog("Login Error", "You must login.");
        }
    }, Common);

    return OfferingsView;
});
