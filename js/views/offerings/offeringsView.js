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
], function($, _, bootstrap, Backbone, offeringsTemplate, OfferingDesignView, PortfoliosView, Offering, Common) {

  var OfferingsView = Backbone.View.extend({

    tagName: 'div',

    template: _.template(offeringsTemplate),

    offeringDesignView: undefined,

    portfoliosView: undefined,

    events: {
      "click #offerings_portfolios a": "changeTabs"
    },

    initialize: function() {
      $("#main").html(this.el);
      this.$el.html(this.template);
      var offeringsView = this;
    },

    render: function() {
      this.changeTabs();
    },

    changeTabs: function(evt) {
      console.log("changing Tabs");
      if (evt && $(evt.target).attr("href") === '#portfolios_tab') {
        console.log("Switching to portfoliosView");
        if (!this.portfoliosView) {
          this.portfoliosView = new PortfoliosView();
        }
        this.portfoliosView.render();
      } else {
        console.log("Switching to OfferingDesignView");
        if (!this.offeringDesignView) {
          this.offeringDesignView = new OfferingDesignView();
        }
        this.offeringDesignView.render();
      }
    },

    close: function() {
      this.$el.empty();
      this.undelegateEvents();
      this.stopListening();
      this.unbind();
    }
  });

  var offeringsView;

  Common.router.on('route:offerings', function() {
    if(!Common.authenticate({ redirect: 'here' })) {
      return;
    }
    if (this.previousView !== offeringsView) {
      this.unloadPreviousState();
      offeringsView = new OfferingsView();
      this.setPreviousState(offeringsView);
    }
    offeringsView.render();
  }, Common);

  return OfferingsView;
});