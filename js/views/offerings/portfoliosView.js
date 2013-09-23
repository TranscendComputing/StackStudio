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
		'text!templates/offerings/portfoliosTemplate.html',
		'collections/portfolios',
		'collections/offerings',
		'models/portfolio'
], function( $, _, bootstrap, Backbone, Common, portfoliosTemplate, Portfolios, Offerings, Portfolio ) {

	var PortfoliosView = Backbone.View.extend({

		tagName: 'div',

		template: _.template(portfoliosTemplate),

		portfolios: undefined,

		offerings: undefined,

		currentPortfolio: undefined,
		
		events: {
			"click #new_portfolio_button": "newPortfolio",
			"click #save_portfolio_button": "savePortfolio",
			"click #close_portfolio_button": "closePortfolio",
            "click #delete_portfolio_button": "deletePortfolio",
			"click .portfolio": "openPortfolio"
		},

		initialize: function() {
			$("#portfolios_container").html(this.el);
            this.$el.html(this.template);
            this.portfolios = new Portfolios();
            this.portfolios.on( 'reset', this.addAllPortfolios, this );
            this.offerings = new Offerings();
            this.offerings.on( 'reset', this.addAllOfferings, this );
            var portfolioApp = this;
            Common.vent.off("portfolioCreated");
            Common.vent.on("portfolioCreated", function(newPortfolio) {
                portfolioApp.currentPortfolio = new Portfolio(newPortfolio.portfolio);
                portfolioApp.render();
            });
            Common.vent.off("portfolioUpdated");
            Common.vent.on("portfolioUpdated", function(updatedPortfolio) {
                portfolioApp.currentPortfolio = new Portfolio(updatedPortfolio.portfolio);
                portfolioApp.render();
            });
            Common.vent.off("portfolioDeleted");
            Common.vent.on("portfolioDeleted", function() {
                portfolioApp.closePortfolio();
            });
		},

		render: function(){
			this.portfolios.fetch({reset:true});
            if(this.currentPortfolio) {
                if(this.currentPortfolio.id === "") {
                    $("#portfolio_offerings_list_label").html("Offerings to Include");
                    $("#portfolio_name_input").val("");
                    $("#portfolio_version_input").val("");
                    $("#portfolio_description_input").val("");
                }else {
                    $("#portfolio_offerings_list_label").html("Offerings Included");
                    $("#portfolio_name_input").val(this.currentPortfolio.attributes.name);
                    $("#portfolio_version_input").val(this.currentPortfolio.attributes.version);
                    $("#portfolio_description_input").val(this.currentPortfolio.attributes.description);
                    $("#portfolio_offerings_list").empty();
                    $.each(this.currentPortfolio.attributes.offerings, function(index, value) {
                        $("#portfolio_offerings_list").append("<li>"+value.offering.name+"</li>");
                    });
                }
                $("#portfolio_not_opened").hide();
                $("#portfolio_open").show();
            }else {
                $("#portfolio_open").hide();
                $("#portfolio_not_opened").show();
            }
		},

		addAllPortfolios: function() {
			$("#portfolio_list").empty();
			this.portfolios.each(function(portfolio) {
				$("#portfolio_list").append("<li><a id='"+portfolio.id+"' class='portfolio selectable_item'>"+portfolio.attributes.name+"</a></li>");
			});
		},

		addAllOfferings: function() {
			$("#portfolio_offerings_list").empty();
            this.offerings.each(function(offering) {
                $("#portfolio_offerings_list").append("<li><label class='checkbox'><input type='checkbox' style='margin-top:1px' name='offering' value='"+offering.id+"'>"+offering.attributes.name+"</label></li>");
            });
		},

		newPortfolio: function() {
            if(this.currentPortfolio) {
                var confirmation = confirm("Are you sure you want to open a new portfolio? Any unsaved changes to the current portfolio will be lose.");
                if(confirmation === true) {
                    this.openNewPortfolio();
                }
            }else {
                this.openNewPortfolio();
            }
        },

        openNewPortfolio: function() {
            this.currentPortfolio = new Portfolio();
            this.offerings.fetch({reset:true});
            this.render();
        },

        openPortfolio: function() {
            if(this.currentPortfolio) {
                var confirmation = confirm("Are you sure you want to open " + event.target.innerText + "? Any unsaved changes to the current portfolio will be lost.");
                if(confirmation === true) {
                    this.currentPortfolio = this.portfolios.get(event.target.id);
                    this.render();
                }
            }else {
                this.currentPortfolio = this.portfolios.get(event.target.id);
                this.render();
            }
        },

        savePortfolio: function() {
            if($("#offering_name_input").val().trim !== "") {
                // Get Selected Offering IDs
                var offeringIds = [];
                $.each($("input:checked[type=checkbox][name=offering]"), function(index, value) {
                    offeringIds.push(value.value);
                });
                // Build Portfolio Object from form
                var options = {
                    "name": $("#portfolio_name_input").val(),
                    "org_id": sessionStorage.org_id,
                    "version": $("#portfolio_version_input").val(),
                    "description": $("#portfolio_description_input").val(),
                    "offering_ids": offeringIds
                };
                // Create/Update Portfolio
                if(this.currentPortfolio.id === "") {
                    this.currentPortfolio.create(options);
                }else {
                    this.currentPortfolio.update(options);
                }
            }else {
                Common.errorDialog({title:"Invalid Request", message:"You must provide a name for this portfolio."});
            }
        },

        closePortfolio: function() {
            this.currentPortfolio = undefined;
            this.render();
        },

        deletePortfolio: function() {
            if(this.currentPortfolio) {
                var confirmation = confirm("Are you sure you want to delete " + this.currentPortfolio.attributes.name + "?");
                if(confirmation === true) {
                    this.currentPortfolio.destroy();
                }
            }
        },
		
		close: function(){
			this.$el.empty();
			this.undelegateEvents();
			this.stopListening();
			this.unbind();
		}
	});

	return PortfoliosView;
});
