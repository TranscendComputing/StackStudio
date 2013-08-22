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
        'text!templates/offerings/offeringsTemplate.html'
], function( $, _, bootstrap, Backbone, Common, offeringsTemplate ) {

    var OfferingsView = Backbone.View.extend({

        tagName: 'div',

        template: _.template(offeringsTemplate),

        events: {

        },

        initialize: function() {
            $("#main").html(this.el);
            this.$el.html(this.template);
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
