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
        'text!templates/meshes/subComponentTemplate.html'//,
        // 'collections/grids',
        // 'models/grid'
], function( $, _, bootstrap, Backbone, Common,
    gridsTemplate//,
    // Grids,
    // Grid
) {

    var GridsView = Backbone.View.extend({

        tagName: 'div',

        template: _.template(gridsTemplate),

        grids: undefined,

        offerings: undefined,

        currentGrid: undefined,
        
        events: {
            "click #new_grid_button": "newGrid",
            "click #save_grid_button": "saveGrid",
            "click #close_grid_button": "closeGrid",
            "click #delete_grid_button": "deleteGrid",
            "click .grid": "openGrid"
        },

        initialize: function() {
            $("#grids_container").html(this.el);
            this.$el.html(this.template);
            // this.grids = new Grids();
            // this.grids.on( 'reset', this.addAllGrids, this );
            // this.offerings = new Offerings();
            // this.offerings.on( 'reset', this.addAllOfferings, this );
            // var gridApp = this;
            // Common.vent.off("gridCreated");
            // Common.vent.on("gridCreated", function(newGrid) {
            //     gridApp.currentGrid = new Grid(newGrid.grid);
            //     gridApp.render();
            // });
            // Common.vent.off("gridUpdated");
            // Common.vent.on("gridUpdated", function(updatedGrid) {
            //     gridApp.currentGrid = new Grid(updatedGrid.grid);
            //     gridApp.render();
            // });
            // Common.vent.off("gridDeleted");
            // Common.vent.on("gridDeleted", function() {
            //     gridApp.closeGrid();
            // });
        },

        render: function(){
            this.grids.fetch({reset:true});
            if(this.currentGrid) {
                if(this.currentGrid.id === "") {
                    $("#grid_offerings_list_label").html("Offerings to Include");
                    $("#grid_name_input").val("");
                    $("#grid_version_input").val("");
                    $("#grid_description_input").val("");
                }else {
                    $("#grid_offerings_list_label").html("Offerings Included");
                    $("#grid_name_input").val(this.currentGrid.attributes.name);
                    $("#grid_version_input").val(this.currentGrid.attributes.version);
                    $("#grid_description_input").val(this.currentGrid.attributes.description);
                    $("#grid_offerings_list").empty();
                    $.each(this.currentGrid.attributes.offerings, function(index, value) {
                        $("#grid_offerings_list").append("<li>"+value.offering.name+"</li>");
                    });
                }
                $("#not_selected").hide();
                $("#component_open").show();
            }else {
                $("#component_open").hide();
                $("#not_selected").show();
            }
        },

        addAllGrids: function() {
            $("#grid_list").empty();
            this.grids.each(function(grid) {
                $("#grid_list").append("<li><a id='"+grid.id+"' class='grid selectable_item'>"+grid.attributes.name+"</a></li>");
            });
        },

        addAllOfferings: function() {
            $("#grid_offerings_list").empty();
            this.offerings.each(function(offering) {
                $("#grid_offerings_list").append("<li><label class='checkbox'><input type='checkbox' style='margin-top:1px' name='offering' value='"+offering.id+"'>"+offering.attributes.name+"</label></li>");
            });
        },

        newGrid: function() {
            if(this.currentGrid) {
                var confirmation = confirm("Are you sure you want to open a new grid? Any unsaved changes to the current grid will be lose.");
                if(confirmation === true) {
                    this.openNewGrid();
                }
            }else {
                this.openNewGrid();
            }
        },

        openNewGrid: function() {
            // this.currentGrid = new Grid();
            // this.offerings.fetch({reset:true});
            // this.render();
        },

        openGrid: function() {
            if(this.currentGrid) {
                var confirmation = confirm("Are you sure you want to open " + event.target.innerText + "? Any unsaved changes to the current grid will be lost.");
                if(confirmation === true) {
                    this.currentGrid = this.grids.get(event.target.id);
                    this.render();
                }
            }else {
                this.currentGrid = this.grids.get(event.target.id);
                this.render();
            }
        },

        saveGrid: function() {
            if($("#offering_name_input").val().trim !== "") {
                // Get Selected Offering IDs
                var offeringIds = [];
                $.each($("input:checked[type=checkbox][name=offering]"), function(index, value) {
                    offeringIds.push(value.value);
                });
                // Build Grid Object from form
                var options = {
                    "name": $("#grid_name_input").val(),
                    "org_id": sessionStorage.org_id,
                    "version": $("#grid_version_input").val(),
                    "description": $("#grid_description_input").val(),
                    "offering_ids": offeringIds
                };
                // Create/Update Grid
                if(this.currentGrid.id === "") {
                    this.currentGrid.create(options);
                }else {
                    this.currentGrid.update(options);
                }
            }else {
                Common.errorDialog({title:"Invalid Request", message:"You must provide a name for this grid."});
            }
        },

        closeGrid: function() {
            this.currentGrid = undefined;
            this.render();
        },

        deleteGrid: function() {
            if(this.currentGrid) {
                var confirmation = confirm("Are you sure you want to delete " + this.currentGrid.attributes.name + "?");
                if(confirmation === true) {
                    this.currentGrid.destroy();
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

    return GridsView;
});
