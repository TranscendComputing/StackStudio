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
        'views/offerings/offeringDesignView',
        'common',
        'models/offering',
        'text!templates/offerings/offeringsTemplate.html'
], function( $, _, bootstrap, Backbone, OfferingDesignView, Common, Offering, offeringsTemplate ) {

    var OfferingsView = Backbone.View.extend({

        tagName: 'div',

        template: _.template(offeringsTemplate),
        _offeringDesignView: null,
        currentOffering: {},

        events: {
            "click #newOfferingButton": "newOfferingButtonClickHandler"
        },

        newOfferingButtonClickHandler: function(evt){
            this.currentOffering = new Offering();
            this._offeringDesignView = new OfferingDesignView({el: $("#editOfferingContainer"), model:this.currentOffering});
            
            this._offeringDesignView.render();
            this._offeringDesignView.on("offeringEditCancelled", $.proxy(this.cancelOfferingEditHandler, this));
        },

        initialize: function() {
            $("#main").html(this.el);
            this.$el.html(this.template);
        },

        configureTabs: function(){
            $("#offeringsTabs a:first").tab("show");

            $("#offeringsTabs a").click(function(e){
                e.preventDefault();
                $(this).tab('show');
            });
        },

        render: function(){
            this.configureTabs();
        },

        cancelOfferingEditHandler: function(){
            $("#editOfferingContainer").empty();
            this.currentOffering = null;
        },

        close: function(){
            this.$el.empty();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
        }
    });

    var offeringsView;

    Common.router.on('route:offerings', function () {
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
