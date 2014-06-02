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
        'text!templates/meshes/subcomponentTemplate.html'//,
        // 'collections/capsules',
        // 'models/capsule'
], function( $, _, bootstrap, Backbone, Common,
    capsulesTemplate//, 
    // Capsules, 
    // Capsule
) {

    var CapsulesView = Backbone.View.extend({

        tagName: 'div',

        template: _.template(capsulesTemplate),

        capsules: undefined,

        currentCapsule: undefined,
        
        events: {
            "click #new_component_button": "newCapsule"
            // "click #save_capsule_button": "saveCapsule",
            // "click #close_capsule_button": "closeCapsule",
            // "click #delete_capsule_button": "deleteCapsule",
            // "click .capsule": "openCapsule"
        },

        initialize: function() {
            $("#capsules_container").html(this.el);
            this.$el.html(this.template);
            // this.capsules = new Capsules();
            // this.capsules.on( 'reset', this.addAllCapsules, this );
            var capsuleApp = this;
            Common.vent.off("capsuleCreated");
            capsuleApp.render();
            // Common.vent.on("capsuleCreated", function(newCapsule) {
            //     capsuleApp.currentCapsule = new Capsule(newCapsule.capsule);
            //     capsuleApp.render();
            // });
            // Common.vent.off("capsuleUpdated");
            // Common.vent.on("capsuleUpdated", function(updatedCapsule) {
            //     capsuleApp.currentCapsule = new Capsule(updatedCapsule.capsule);
            //     capsuleApp.render();
            // });
            // Common.vent.off("capsuleDeleted");
            // Common.vent.on("capsuleDeleted", function() {
            //     capsuleApp.closeCapsule();
            // });
        },

        render: function(){
            // this.capsules.fetch({reset:true});
            $("#component_list").text("Capsules");
            $('#not_selected_message').text('Select an capsule from the list to the left, or begin by creating a new capsule!');
            $("#capsule_version_input").val("");
            $("#capsule_description_input").val("");
            if(this.currentCapsule) {
                if(this.currentCapsule.id === "") {
                }else {
                    $("#capsule_offerings_list_label").html("Offerings Included");
                    $("#capsule_name_input").val(this.currentCapsule.attributes.name);
                    $("#capsule_version_input").val(this.currentCapsule.attributes.version);
                    $("#capsule_description_input").val(this.currentCapsule.attributes.description);
                }
                $("#not_selected").hide();
                $("#capsule_open").show();
            }else {
                $("#capsule_open").hide();
                $("#not_selected").show();
            }
        },

        // addAllCapsules: function() {
        //     $("#capsule_list").empty();
        //     this.capsules.each(function(capsule) {
        //         $("#capsule_list").append("<li><a id='"+capsule.id+"' class='capsule selectable_item'>"+capsule.attributes.name+"</a></li>");
        //     });
        // },

        newCapsule: function() {
            this.openNewCapsule();
        },

        openNewCapsule: function() {
            this.currentCapsule = new Capsule();
            this.render();
        },

        // openCapsule: function() {
        //     if(this.currentCapsule) {
        //         var confirmation = confirm("Are you sure you want to open " + event.target.innerText + "? Any unsaved changes to the current capsule will be lost.");
        //         if(confirmation === true) {
        //             this.currentCapsule = this.capsules.get(event.target.id);
        //             this.render();
        //         }
        //     }else {
        //         this.currentCapsule = this.capsules.get(event.target.id);
        //         this.render();
        //     }
        // },

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
