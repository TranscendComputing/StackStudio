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
        'text!templates/offerings/offeringsTemplate.html',
        'views/offerings/offeringDesignView',
        'views/offerings/portfoliosView',
        'models/offering',
        'common'
], function( $, _, bootstrap, Backbone, offeringsTemplate, OfferingDesignView, PortfoliosView, Offering, Common ) {

    var OfferingsView = Backbone.View.extend({

        tagName: 'div',

        template: _.template(offeringsTemplate),

        offeringDesignView: undefined,

        portfoliosView: undefined,

        events: {
            
        },

        initialize: function() {
            $("#main").html(this.el);
            this.$el.html(this.template);
            //Add event when tabs change
            $('a[data-toggle="tab"]').off('shown');
            var offeringsView = this;
            $('a[data-toggle="tab"]').on('shown', function (e) {
                offeringsView.changeTabs();
            });
        },

        render: function(){
            this.changeTabs();
        },

        changeTabs: function() {
            if($("#design_offerings_tab").hasClass("active")) {
                if(!this.offeringDesignView) {
                    this.offeringDesignView = new OfferingDesignView();
                }
                this.offeringDesignView.render();
            }else {
                if(!this.portfoliosView) {
                    this.portfoliosView = new PortfoliosView();
                }
                this.portfoliosView.render();
            }
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
