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
        'text!templates/meshes/grid.html',
        'collections/grids',
        'models/grid'
], function(
    $,
    _,
    bootstrap,
    Backbone,
    Common,
    ich,
    mainPageTemplate,
    gridTemplate,
    Grids,
    Grid
) {

    var GridsView = Backbone.View.extend({

        tagName: 'div',

        template: _.template(mainPageTemplate),

        gridTemplate: _.template(gridTemplate),

        primaryActions: [ "Start", "Stop", "Delete" ],

        grids: undefined,

        currentGrid: undefined,
        
        events: {
            "click #new_component_button": "newGrid",
            // "click #save_grid_button": "saveGrid",
            // "click #close_grid_button": "closeGrid",
            // "click #delete_grid_button": "deleteGrid",
            "click .grid": "openGrid"
        },

        initialize: function() {
            $("#grids_container").html(this.el);
            this.$el.html(this.template);
            ich.refresh();
            this.grids = new Grids();
            this.grids.on( 'reset', this.addAllGrids, this );
            var gridApp = this;
            Common.vent.off("gridCreated");
            gridApp.render();
            Common.vent.on("gridCreated", function(newGrid) {
                gridApp.currentGrid = new Grid(newGrid.grid);
                gridApp.render();
            });
            Common.vent.off("gridUpdated");
            Common.vent.on("gridUpdated", function(updatedGrid) {
                gridApp.currentGrid = new Grid(updatedGrid.grid);
                gridApp.render();
            });
            Common.vent.off("gridDeleted");
            Common.vent.on("gridDeleted", function() {
                gridApp.closeGrid();
            });
        },

        render: function(){
            this.grids.fetch({reset:true});
            var actions = ich.component_actions({ primary_actions: this.primaryActions });
            $("#button_group").html(actions);
            if (this.currentGrid) {
                var templ = this.gridTemplate({ grid: this.currentGrid.attributes }, {variable: 'grid'});
                if ($("#grid_details").length > 0) {
                    $("#grid_details").html(templ);
                }else {
                    $("#component_open").append(templ);
                }
            }
            $("#component_list_title").text("Grids");
            $('#not_selected_message').text('Select a grid from the list to the left, or begin by creating a new grid!');
            if(this.currentGrid) {
                $("#not_selected").hide();
                $("#component_open").show();
            }else {
                $("#component_open").hide();
                $("#not_selected").show();
            }
        },

        addAllGrids: function() {
            $("#component_list").empty();
            this.grids.each(function(grid) {
                $("#component_list").append("<li><a id='"+grid.attributes.StackName+"' class='grid selectable_item'>"+grid.attributes.StackName+"</a></li>");
            });
        },

        newGrid: function() {
            this.openNewGrid();
        },

        openNewGrid: function() {
            this.currentGrid = new Grid();
            this.render();
        },

        openGrid: function() {
            this.currentGrid = this.grids.get(event.target.id);
            this.render();
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
