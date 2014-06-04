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

        el: '#appliances_container',

        template: _.template(mainPageTemplate),

        applianceTemplate: _.template(applianceTemplate),

        primaryActions: [ "Clone", "Delete" ],

        secondaryActions: [ "Start", "Stop", "Remove" ],
        
        events: {
            "click #new_component_button": "newAppliance",
            "click #save_appliance_button": "saveAppliance",
            "click .appliance": "openAppliance"
        },

        initialize: function() {
            $("#appliances_container").html(this.el);
            this.$el.html(this.template);
            ich.refresh();
            this.collection = new Appliances();
            this.collection.on( 'reset', this.addAllAppliances, this );
            var applianceApp = this;
            Common.vent.off("applianceCreated");
            applianceApp.render();
            Common.vent.on("applianceCreated", function(newAppliance) {
                applianceApp.model = new Appliance(newAppliance.appliance);
                applianceApp.render();
            });
            Common.vent.off("applianceUpdated");
            Common.vent.on("applianceUpdated", function(updatedAppliance) {
                applianceApp.model = new Appliance(updatedAppliance.appliance);
                applianceApp.render();
            });
            Common.vent.off("applianceDeleted");
            Common.vent.on("applianceDeleted", function() {
                applianceApp.closeAppliance();
            });
        },

        render: function(){
            this.collection.fetch({reset:true});
            var actions = ich.component_actions({ primary_actions: this.primaryActions, secondary_actions: this.secondaryActions });
            $("#button_group").html(actions);
            if (this.model) {
                var appliance_spec_form = this.applianceTemplate({ appliance: this.model.attributes }, {variable: 'appliance'});
                if ($("#appliance_spec_form").length > 0) {
                    $("#appliance_spec_form").html(appliance_spec_form);
                }else {
                    $("#component_open").append(appliance_spec_form);
                }
            }
            $("#component_list_title").text("Appliances");
            $('#not_selected_message').text('Select an appliance from the list to the left, or begin by creating a new appliance!');
            if(this.model) {
                $("#not_selected").hide();
                $("#component_open").show();
            }else {
                $("#component_open").hide();
                $("#not_selected").show();
            }
        },

        addAllAppliances: function() {
            $("#component_list").empty();
            this.collection.each(function(appliance) {
                $("#component_list").append("<li><a id='"+appliance.attributes.Name+"' class='appliance selectable_item'>"+appliance.attributes.Name+"</a></li>");
            });
        },

        newAppliance: function() {
            this.openNewAppliance();
        },

        openNewAppliance: function() {
            this.model = new Appliance();
            this.render();
        },

        openAppliance: function() {
            this.model = this.collection.get(event.target.id);
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
                if(this.model.id === "") {
                    this.model.create(options);
                }else {
                    this.model.update(options);
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
