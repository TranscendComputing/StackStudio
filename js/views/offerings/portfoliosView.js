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
		'collections/portfolios',
		'text!templates/offerings/portfoliosTemplate.html'
], function( $, _, bootstrap, Backbone, Common, Portfolios, PortfolioViewTemplate ) {

	var OfferingsView = Backbone.View.extend({

		tagName: 'div',

		template: _.template(PortfolioViewTemplate),

		model: null,
		
		events: {
			
		},

		initialize: function() {
			
		},

		render: function(){
			var s = this.template({model: this.model});
			this.$el.html(s);
			this.fetchPortfolios()//TODO: Add params?
				.done($.proxy(this.renderPortfolios, this));
		},

		accordionGroupTemplate: ['<div class="accordion-group">',
				'<div class="accordion-heading">',
				  '<a class="accordion-toggle" data-toggle="collapse" data-parent="#{{accordionId}}" href="#{{collapseId}}">{{name}}<span class="badge badge-info pull-right"></span></a>',
				'</div>',
				'<div id="{{collapseId}}" class="accordion-body collapse">',
				  '<div class="accordion-inner">',
				  '</div>',
				'</div>',
			'</div>']
			.join(''),

		renderAccordionGroup: function(accordionId, title){ //TODO: make this a common function
			var elem = this.accordionGroupTemplate
				.split("{{name}}").join(title)
				.split("{{collapseId}}").join(_.uniqueId("portfolio"))
				.split("{{accordionId}}").join(accordionId);
			return elem;
		},

		renderPortfolios: function(portfolios){
			var $this = this;
			var list = $("#portfolioList").empty();
			portfolios.each(function(portfolio){
				var s = $this.renderAccordionGroup("portfolioList", portfolio.get("name"));
				var group = $(s).appendTo(list);
				var inner = group.find("accordion-inner");
				inner.text("editing: " + portfolio.get("name"));
			});
		},

		fetchPortfolios: function(){
			var deferred = $.Deferred();
			var $this = this;
			var portfolios = new Portfolios();
			portfolios.fetch({
				data: {
					//TODO: What data is necessary for stacks?
				},
				success: function(model){
					deferred.resolve(model);
				},
				error: function(model, errors){
					deferred.reject({model: model, errors:errors});
				}
			});
			return deferred.promise();
		},

		savePortfolio: function(){
			var $this = this;
			this.model.save({
				success:function(){
					$this.hideErrors();
					this.trigger("portfolioSaved");
				},
				error:function(model,errors){
					$this.showErrors(errors);
				}
			});
		},

		deletePortfolio: function(){
			var $this = this;
			this.model.destroy({
				success:function(){
					$this.hideErrors();
					this.trigger("portfolioDeleted");
				},
				error:function(model,errors){
					$this.showErrors(errors);
				}
			});
		},

		savePortfolioClick: function(evt){
			this.saveOffering();
		},
		
		cancelPortfolioEditClick: function(evt){
			this.trigger("portfolioEditCancelled");
		},
		
		deletePortfolioClick: function(evt){
			this.deletePortfolio();
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

	Common.router.on('route:offerings/portfolios', function () {
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
