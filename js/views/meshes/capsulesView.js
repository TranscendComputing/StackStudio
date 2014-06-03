/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2014 Transcend Computing <http://www.transcendcomputing.com/>
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
        'icanhaz',
        'text!templates/components/mainPage.html',
        'text!templates/meshes/capsule.html',
        'collections/capsules',
        'models/capsule'
], function(
    $,
    _,
    bootstrap,
    Backbone,
    Common,
    ich,
    mainPageTemplate,
    capsuleTemplate,
    Capsules,
    Capsule
) {

    var CapsulesView = Backbone.View.extend({

        tagName: 'div',

        template: _.template(mainPageTemplate),

        capsuleTemplate: _.template(capsuleTemplate),

        primaryActions: [ "Edit", "Delete" ],

        capsules: undefined,

        currentCapsule: undefined,
        
        events: {
            "click #new_component_button": "newCapsule",
            // "click #save_capsule_button": "saveCapsule",
            // "click #close_capsule_button": "closeCapsule",
            // "click #delete_capsule_button": "deleteCapsule",
            "click .capsule": "openCapsule"
        },

        initialize: function() {
            $("#capsules_container").html(this.el);
            _.templateSettings.variable = 'capsuleSpec';
            this.$el.html(this.template);
            ich.refresh();
            this.capsules = new Capsules();
            this.capsules.on( 'reset', this.addAllCapsules, this );
            var capsuleApp = this;
            Common.vent.off("capsuleCreated");
            capsuleApp.render();
            Common.vent.on("capsuleCreated", function(newCapsule) {
                capsuleApp.currentCapsule = new Capsule(newCapsule.capsule);
                capsuleApp.render();
            });
            Common.vent.off("capsuleUpdated");
            Common.vent.on("capsuleUpdated", function(updatedCapsule) {
                capsuleApp.currentCapsule = new Capsule(updatedCapsule.capsule);
                capsuleApp.render();
            });
            Common.vent.off("capsuleDeleted");
            Common.vent.on("capsuleDeleted", function() {
                capsuleApp.closeCapsule();
            });
        },

        render: function(){
            this.capsules.fetch({reset:true});
            var actions = ich.component_actions({ primary_actions: this.primaryActions });
            $("#button_group").html(actions);
            if (this.currentCapsule) {
                var templ = this.capsuleTemplate({ capsuleSpec: this.currentCapsule.attributes }, {variable: 'capsuleSpec'});
                if ($("#capsule_spec_form").length > 0) {
                    $("#capsule_spec_form").html(templ);
                }else {
                    $("#component_open").append(templ);
                }
            }
            $("#component_list_title").text("Capsules");
            $('#not_selected_message').text('Select a capsule from the list to the left, or begin by creating a new capsule!');
            if(this.currentCapsule) {
                $("#not_selected").hide();
                $("#component_open").show();
            }else {
                $("#component_open").hide();
                $("#not_selected").show();
            }
        },

        addAllCapsules: function() {
            $("#component_list").empty();
            this.capsules.each(function(capsule) {
                $("#component_list").append("<li><a id='"+capsule.attributes.ImageURL+"' class='capsule selectable_item'>"+capsule.attributes.ImageURL+"</a></li>");
            });
        },

        newCapsule: function() {
            this.openNewCapsule();
        },

        openNewCapsule: function() {
            this.currentCapsule = new Capsule();
            this.render();
        },

        openCapsule: function() {
            this.currentCapsule = this.capsules.get(event.target.id);
            this.render();
        },

        // saveCapsule: function() {
        //     if($("#offering_name_input").val().trim !== "") {
        //         // Get Selected Offering IDs
        //         var offeringIds = [];
        //         $.each($("input:checked[type=checkbox][name=offering]"), function(index, value) {
        //             offeringIds.push(value.value);
        //         });
        //         // Build Capsule Object from form
        //         var options = {
        //             "name": $("#capsule_name_input").val(),
        //             "org_id": sessionStorage.org_id,
        //             "version": $("#capsule_version_input").val(),
        //             "description": $("#capsule_description_input").val(),
        //             "offering_ids": offeringIds
        //         };
        //         // Create/Update Capsule
        //         if(this.currentCapsule.id === "") {
        //             this.currentCapsule.create(options);
        //         }else {
        //             this.currentCapsule.update(options);
        //         }
        //     }else {
        //         Common.errorDialog({title:"Invalid Request", message:"You must provide a name for this capsule."});
        //     }
        // },

        // closeCapsule: function() {
        //     this.currentCapsule = undefined;
        //     this.render();
        // },

        // deleteCapsule: function() {
        //     if(this.currentCapsule) {
        //         var confirmation = confirm("Are you sure you want to delete " + this.currentCapsule.attributes.name + "?");
        //         if(confirmation === true) {
        //             this.currentCapsule.destroy();
        //         }
        //     }
        // },
        
        close: function(){
            this.$el.empty();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
        }
    });

    return CapsulesView;
});
