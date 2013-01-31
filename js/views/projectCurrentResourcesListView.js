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
        'collections/template_resources',
        'common',
        'jquery.jstree'
], function( $, _, Backbone, resources, Common ) {

    var ProjectCurrentResourcesListView = Backbone.View.extend({

        //TODO define element
        //OR use tagName, className, ...
        el: "#current_outline",

        tree: undefined,

        events: {
            'click .jstree-open': 'cancelRequest',
            'click .jstree-closed': 'cancelRequest',
            'click #open_all': 'openAll',
            'click #collapse_all': 'collapseAll'
        },

        initialize: function(){
             $("#current_outline").on("rename_node.jstree", this.handleRename);
             Common.vent.on("project:updateTemplate", this.updateTree, this);
        },

        render: function() {
            this.tree = $("#current_outline").jstree({
                // List of active plugins
                "plugins" : [
                    "json_data", "crrm", "themeroller"
                ],

                "core": {
                    "animation": 0,
                    "load_open": true
                },

                // I usually configure the plugin that handles the data first
                // This example uses JSON as it is most common
                "json_data" : {
                    "data": [
                        {
                            "data": {
                                "title": "Resources"
                            },
                            "attr": {"id": "current_resources"},
                            "state": "closed",
                            "metadata": {"parent_tree": "#current_outline"}
                        },
                        {
                            "data": {
                                "title": "Parameters"
                            },
                            "attr": {"id": "current_parameters"},
                            "state": "closed",
                            "metadata": {"parent_tree": "#current_outline"}
                        },
                        {
                            "data": {
                                "title": "Mappings"
                            },
                            "attr": {"id": "current_mappings"},
                            "state": "closed",
                            "metadata": {"parent_tree": "#current_outline"}
                        },
                        {
                            "data": {
                                "title": "Outputs"
                            },
                            "attr": {"id": "current_outputs"},
                            "state": "closed",
                            "metadata": {"parent_tree": "#current_outline"}
                        }
                    ],
                    "correct_state": false,
                    "progressive_render": true
                },

                "themeroller": {
                    "item": "jstree_custom_item"
                }
            });
        },

        updateTree: function(currentTemplate) {
            if ( !currentTemplate || currentTemplate === '') {
                return;
            }

            var template;

            try{
                template = $.parseJSON(currentTemplate);
                var newData = this.walkTemplate(template);
                //this.tree.jstree.save_opened();
                this.tree.jstree("focused")._get_settings().json_data.data = newData;
                this.tree.jstree("focused").refresh(-1);
                //this.tree.jstree.reopen();
            } catch (e) {
                console.log('Parsing error!!!   ', currentTemplate, e);
                return;
            }
        },

        walkTemplate: function(template) {
            var data = [];
            for (var prop in template) {
                var node = { "data": prop, "metadata": {"parent_tree": "#current_outline"}};
                if (template.hasOwnProperty(prop)) {
                    var val = template[prop];
                    if (!node.children) {
                            node.children = [];
                    }
                    if (typeof val === 'string') {
                        node.children.push({ "data" : val, "metadata": {"parent_tree": "#current_outline"} });
                    } else if (typeof val === 'object') {
                        node.children.push(this.walkTemplate(val));
                    }
                }
                data.push(node);
            }
            return data;
        },

        handleRename: function(e, object) {
            var resourceName = object.args[1];
            Common.vent.trigger("project:renameResource", resourceName);
        },

        cancelRequest: function() {
            return false;
        },

        openAll: function() {
            this.tree.jstree("open_all");
        },

        collapseAll: function() {
            this.tree.jstree("close_all");
        }

    });

    return ProjectCurrentResourcesListView;
});
