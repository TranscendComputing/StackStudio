/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
define([
        'jquery',
        'underscore',
        'backbone',
        'common',
        'text!templates/stacks/stackRunTemplate.html',
        'jquery.jstree'
], function( $, _, Backbone, Common, stacksRunTemplate ) {
    'use strict';

    var StackRunView = Backbone.View.extend({

        template: _.template( stacksRunTemplate ),

        stackResourceTree: undefined,

        events: {
            "click .jstree_custom_item": "treeFolderClick"
        },

        initialize: function() {
            
        },

        render: function() {
            $("#run_time_content").html(this.el);
            this.$el.html(this.template);
            this.stackResourceTree = $("#stack_resource_tree").jstree({
                // List of active plugins
                "plugins" : [
                    "json_data", "crrm", "themeroller"
                ],
                
                "core": {
                    "animation": 0
                 },

                "json_data" : {
                    "ajax": {
                        "url": "samples/stackRunResources.json",
                        "success": function(data) {
                            var services = {};
                            var itemId;
                            $.each(data, function(index, d) {
                                 if (services[d.service] === undefined) {
                                     services[d.service] = [];
                                 }
                                 //Add reference to parent tree
                                 d.parent_tree = "#new_resources";
                                 var resource_state_class = "resource_not_running";
                                 if(d.state === "running") {
                                    resource_state_class = "resource_running";
                                 }else {
                                    resource_state_class = "resource_not_running";
                                 }
                                 services[d.service].push({
                                     "data": {
                                         "title": d.label, 
                                         "attr": {
                                             "id": d.label, 
                                             "class": "new_item_link " + resource_state_class
                                         } 
                                     },
                                     "attr": {"id": itemId + "_container"},
                                     "metadata": d
                                 });
                            });
                            
                            var treeData = [];
                            $.each(services, function(s, v) {
                                treeData.push({
                                    data: s,
                                    children: v,
                                    "metadata": {"parent_tree": "#stack_resource_tree"} 
                                });
                            });
                            return treeData;
                        }
                    },
                    "correct_state": false
                },
                
                "themeroller": {
                    "item": "jstree_custom_item"
                }
            });
        },

        treeFolderClick: function(event) {
            if($(event.target.parentElement).hasClass("jstree-closed")) {
                $(event.target.parentElement).removeClass("jstree-closed");
                $(event.target.parentElement).addClass("jstree-open");
            }else{
                $(event.target.parentElement).removeClass("jstree-open");
                $(event.target.parentElement).addClass("jstree-closed");
            }
            return false;
        }
    });

    return StackRunView;
});