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
        'text!templates/offerings/offeringDesignViewTemplate.html',
        'collections/offerings',
        'collections/stacks',
        'models/offering'
], function( $, _, bootstrap, Backbone, Common, offeringDesignViewTemplate, Offerings, Stacks, Offering ) {

    var OfferingDesignView = Backbone.View.extend({

        tagName: 'div',

        template: _.template(offeringDesignViewTemplate),

        currentOffering: undefined,

        stacks: undefined,

        events: {
            "click #new_offering_button": "newOffering",
            "click #offering_save_button": "saveOffering",
            "click #offering_close_button": "closeOffering",
            "click .offering": "openOffering",
            "click .offering_delete": "deleteOffering"
        },

        initialize: function() {
            $("#offering_design_container").html(this.el);
            this.$el.html(this.template);
            this.offerings = new Offerings();
            this.offerings.on( 'reset', this.addAllOfferings, this );
            this.stacks = new Stacks();
            this.stacks.on( 'reset', this.addAllStacks, this );
            var offeringApp = this;
            Common.vent.off("offeringCreated");
            Common.vent.on("offeringCreated", function(newOffering) {
                offeringApp.currentOffering = new Offering(newOffering.offering);
                offeringApp.render();
            });
            Common.vent.off("offeringUpdated");
            Common.vent.on("offeringUpdated", function(updatedOffering) {
                offeringApp.currentOffering = new Offering(updatedOffering.offering);
                offeringApp.render();
            });
            Common.vent.off("offeringDeleted");
            Common.vent.on("offeringDeleted", function() {
                offeringApp.render();
            });
        },

        render: function() {
            this.offerings.fetch({reset:true});
            this.stacks.fetch({reset: true});
            if(this.currentOffering) {
                if(this.currentOffering.id === "") {
                    // Clear the offering form
                    $("#offering_name_input").val("");
                    $("#offering_version_input").val("");
                    $("#offering_url_input").val("");
                    $("#offering_sku_input").val("");
                    // Clear icon image if exists
                    // Clear illustration image if exists
                    $("#offering_brief_description_input").val("");
                    $("#offering_detailed_description_input").val("");
                    $("#offering_eula_select").val($("#offering_eula_select option:first").val());
                    $("#offering_custom_eula_input").val("");
                    $("#offering_support_input").val("");
                    $("#offering_pricing_input").val("");
                    $("#offering_category_input").val("");
                }else {
                    // Fill in the offering form for the currentOffering
                    $("#offering_name_input").val(this.currentOffering.attributes.name);
                    $("#offering_version_input").val(this.currentOffering.attributes.version);
                    $("#offering_url_input").val(this.currentOffering.attributes.url);
                    $("#offering_sku_input").val(this.currentOffering.attributes.sku);
                    // Load icon image if exists
                    // Load illustration image if exists
                    $("#offering_brief_description_input").val(this.currentOffering.attributes.brief_description);
                    $("#offering_detailed_description_input").val(this.currentOffering.attributes.detailed_description);
                    $("#offering_eula_select").val(this.currentOffering.attributes.eula);
                    $("#offering_custom_eula_input").val(this.currentOffering.attributes.eula_custom);
                    $("#offering_support_input").val(this.currentOffering.attributes.support);
                    $("#offering_pricing_input").val(this.currentOffering.attributes.pricing);
                    $("#offering_category_input").val(this.currentOffering.attributes.category);
                    $.each(this.currentOffering.attributes.stacks, function(index, value) {
                        $("input[type=checkbox][name=stack][value="+value.stack._id+"]").attr("checked", true);
                    });
                }
                $("#offering_not_opened").hide();
                $("#offering_opened").show();
            }else {
                $("#offering_opened").hide();
                $("#offering_not_opened").show();
            }
        },

        addAllOfferings: function() {
            $("#offerings_menu").empty();
            $("#offerings_delete_menu").empty();
            this.offerings.each(function(offering) {
                $("#offerings_menu").append("<li><a id='"+offering.id+"' class='offering'>"+offering.attributes.name+"</a></li>");
                $("#offerings_delete_menu").append("<li><a id='"+offering.id+"' class='offering_delete'>"+offering.attributes.name+"</a></li>");
            });
        },

        addAllStacks: function() {
            $("#offering_stacks_list").empty();
            this.stacks.each(function(stack) {
                $("#offering_stacks_list").append("<li><label class='checkbox'><input type='checkbox' style='margin-top:1px' name='stack' value='"+stack.id+"'>"+stack.attributes.name+"</label></li>");
            });
            if(this.currentOffering) {
                $.each(this.currentOffering.attributes.stacks, function(index, value) {
                    $("input[type=checkbox][name=stack][value="+value.stack._id+"]").attr("checked", true);
                });
            }
        },

        newOffering: function() {
            if(this.currentOffering) {
                var confirmation = confirm("Are you sure you want to open a new offering? Any unsaved changes to the current offering will be lost.");
                if(confirmation === true) {
                    this.currentOffering = new Offering();
                    this.render();
                }
            }else {
                this.currentOffering = new Offering();
                this.render();
            }
        },

        openOffering: function(event) {
            if(this.currentOffering) {
                var confirmation = confirm("Are you sure you want to open " + event.target.innerText + "? Any unsaved changes to the current offering will be lost.");
                if(confirmation === true) {
                    this.currentOffering = this.offerings.get(event.target.id);
                    this.render();
                }
            }else {
                this.currentOffering = this.offerings.get(event.target.id);
                this.render();
            }
        },

        deleteOffering: function(event) {
            var confirmation = confirm("Are you sure you want to delete " + event.target.innerText + "?");
            if(confirmation === true) {
                var offering = this.offerings.get(event.target.id);
                if(this.currentOffering && offering.id === this.currentOffering.id) {
                    this.closeOffering();
                }
                offering.destroy();
            }
        },

        saveOffering: function() {
            if($("#offering_name_input").val().trim !== "") {
                // Get Selected Stack IDs
                var stackIds = [];
                $.each($("input:checked[type=checkbox][name=stack]"), function(index, value) {
                    stackIds.push(value.value);
                });
                // Build Offering Object from form
                var options = {
                    "name": $("#offering_name_input").val(),
                    "account_id": Common.account.id,
                    "version": $("#offering_version_input").val(),
                    "url": $("#offering_url_input").val(),
                    "sku": $("#offering_sku_input").val(),
                    "icon": "",
                    "illustration": "",
                    "brief_description": $("#offering_brief_description_input").val(),
                    "detailed_description": $("#offering_detailed_description_input").val(),
                    "eula": $("#offering_eula_select").val(),
                    "eula_custom": $("#offering_custom_eula_input").val(),
                    "support": $("#offering_support_input").val(),
                    "pricing": $("#offering_pricing_input").val(),
                    "category": $("#offering_category_input").val(),
                    "stack_ids": stackIds
                };
                // Create/Update Offering
                if(this.currentOffering.id === "") {
                    this.currentOffering.create(options);
                }else {
                    this.currentOffering.update(options);
                }
            }else {
                Common.errorDialog({title:"Invalid Request", message:"You must provide a name for this offering."});
            }
        },

        closeOffering: function() {
            this.currentOffering = undefined;
            this.render();
        },

        close: function(){
            this.$el.empty();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
        }
    });

    var offeringDesignView;

    Common.router.on('route:offeringsEdit', function () {
        if(Common.account.id) {
            if (this.previousView !== offeringDesignView) {
                this.unloadPreviousState();
                offeringDesignView = new OfferingDesignView();
                this.setPreviousState(offeringDesignView);
            }
            offeringDesignView.render();
        }else {
            Common.router.navigate("", {trigger: true});
            Common.errorDialog("Login Error", "You must login.");
        }
    }, Common);

    return OfferingDesignView;
});
