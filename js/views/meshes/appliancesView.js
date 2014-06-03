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
        'text!templates/meshes/appliance.html',
        'collections/appliances',
        'models/appliance'
], function( $, _, bootstrap, Backbone, Common, ich,
    mainPageTemplate,
    applianceTemplate,
    Appliances,
    Appliance
) {

    var AppliancesView = Backbone.View.extend({

        tagName: 'div',

        template: _.template(mainPageTemplate),

        applianceTemplate: _.template(applianceTemplate),

        templates: undefined,

        appliances: undefined,

        currentAppliance: undefined,

        primaryActions: [ "Clone", "Delete" ],

        secondaryActions: [ "Start", "Stop", "Remove" ],
        
        events: {
            "click #new_component_button": "newAppliance",
            "click #save_appliance_button": "saveAppliance",
            // "click #close_appliance_button": "closeAppliance",
            // "click #delete_appliance_button": "deleteAppliance",
            "click .appliance": "openAppliance"
        },

        initialize: function() {
            $("#appliances_container").html(this.el);
            this.$el.html(this.template);
            this.$el.append(this.applianceTemplate);
            ich.refresh();
            this.appliances = new Appliances();
            this.appliances.on( 'reset', this.addAllAppliances, this );
            var applianceApp = this;
            Common.vent.off("applianceCreated");
            applianceApp.render();
            Common.vent.on("applianceCreated", function(newAppliance) {
                applianceApp.currentAppliance = new Appliance(newAppliance.appliance);
                applianceApp.render();
            });
            Common.vent.off("applianceUpdated");
            Common.vent.on("applianceUpdated", function(updatedAppliance) {
                applianceApp.currentAppliance = new Appliance(updatedAppliance.appliance);
                applianceApp.render();
            });
            Common.vent.off("applianceDeleted");
            Common.vent.on("applianceDeleted", function() {
                applianceApp.closeAppliance();
            });
        },

        render: function(){
            this.appliances.fetch({reset:true});
            var actions = ich.component_actions({ primary_actions: this.primaryActions, secondary_actions: this.secondaryActions });
            $("#button_group").html(actions);
            if (this.currentAppliance) {
                var form = ich.appliance_form(this.currentAppliance.attributes);
                if ($("#appliance_form").length > 0) {
                    $("#appliance_form").html(form);
                }else {
                    $("#component_open").append(form);
                }
                var appliance_spec_list = ich.appliance_spec_form(this.currentAppliance.attributes.ApplianceSpec);
                if ($("#appliance_spec_form").length > 0) {
                    $("#appliance_spec_form").html(appliance_spec_list);
                }else {
                    $("#component_open").append(appliance_spec_list);
                }
            }
            $("#component_list_title").text("Appliances");
            $('#not_selected_message').text('Select an appliance from the list to the left, or begin by creating a new appliance!');
            if(this.currentAppliance) {
                $("#not_selected").hide();
                $("#component_open").show();
            }else {
                $("#component_open").hide();
                $("#not_selected").show();
            }
        },

        addAllAppliances: function() {
            $("#component_list").empty();
            this.appliances.each(function(appliance) {
                $("#component_list").append("<li><a id='"+appliance.attributes.Name+"' class='appliance selectable_item'>"+appliance.attributes.Name+"</a></li>");
            });
        },

        newAppliance: function() {
            if(this.currentAppliance) {
                var confirmation = confirm("Are you sure you want to open a new appliance? Any unsaved changes to the current appliance will be lose.");
                if(confirmation === true) {
                    this.openNewAppliance();
                }
            }else {
                this.openNewAppliance();
            }
        },

        openNewAppliance: function() {
            this.currentAppliance = new Appliance();
            this.render();
        },

        openAppliance: function() {
            this.currentAppliance = this.appliances.get(event.target.id);
            this.render();
        },

        saveAppliance: function() {
            if($("#name_input").val().trim !== "") {
                // Build Appliance Object from form
                var options = {
                    "name": $("#name_input").val(),
                    "org_id": sessionStorage.org_id,
                    "spec_url": $("#appliance_specification_input").val(),
                    "instance_count": $("#appliance_instance_count_input").val()
                };
                // Create/Update Appliance
                if(this.currentAppliance.id === "") {
                    this.currentAppliance.create(options);
                }else {
                    this.currentAppliance.update(options);
                }
            }else {
                Common.errorDialog({title:"Invalid Request", message:"You must provide a name for this appliance."});
            }
        },

        
        close: function(){
            this.$el.empty();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
        }
    });

    return AppliancesView;
});
