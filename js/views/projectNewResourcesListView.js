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
        'views/projectNewResourceListItemView',
        'common',
        'jquery.jstree'
], function( $, _, Backbone, resources, ProjectNewResourceListItemView, Common ) {
       
    var ProjectNewResourcesListView = Backbone.View.extend({
        
        //TODO define element
        //OR use tagName, className, ...
        el: "#template_resources",
        
        tree: undefined,
        
        events: {
            'click .new_item_link': 'addResource',
            'click #open_all': 'openAll',
            'click #collapse_all': 'collapseAll'
        },
        
        initialize: function(){
            resources.on( 'add', this.addOne, this );
            resources.on( 'reset', this.addAll, this );
            resources.on( 'all', this.render, this );
            this.render();
            // Fetch will pull results from the server
            // resources.fetch({update: true});
            
            $("#template_resources").on("rename_node.jstree", this.handleRename);
        },
        
        render: function() {
            this.tree = $("#template_resources").jstree({ 
                // List of active plugins
                "plugins" : [ 
                    "json_data", "crrm", "themeroller"
                ],
                
                "core": {
                    "animation": 0
                 },
    
                // I usually configure the plugin that handles the data first
                // This example uses JSON as it is most common
                "json_data" : { 
                    "ajax": {
                        "url": "cloud_resources.json",
                        "success": function(data) {
                            var services = {};
                            var itemId;
                            $.each(data, function(index, d) {
                                 if (services[d.service] === undefined) {
                                     services[d.service] = [];
                                 }
                                 //Add reference to parent tree
                                 d.parent_tree = "#template_resources";
                                 itemId = d.label.toLowerCase().replace(/\s/g, "_");
                                 services[d.service].push({
                                     "data": {
                                         "title": d.label, 
                                         "attr": {
                                             "id": itemId, 
                                             "class": "new_item_link"
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
                                    "metadata": {"parent_tree": "#template_resources"} 
                                });
                            });
                            return treeData;
                            //return data.label;
                        }
                    },
                    "correct_state": false
                },
                
                "themeroller": {
                    "item": "jstree_custom_item"
                }
            });
            
            
        },
        
        // Add a single instance item to the list by creating a view for it.
        addOne: function( resource ) {
            var projectNewResourceListItemView = new ProjectNewResourceListItemView({ model: resource });
            this.$el.append(projectNewResourceListItemView.render().el);
        },

        // Add all items in the **Projects** collection at once.
        addAll: function() {
            resources.each(this.addOne, this);
        },
        
        addResource: function(e) {
            var resource = $(e.currentTarget.parentNode).data();
            var groupSelector = "#current_" + resource.group.toLowerCase();
            this.tree.jstree(
                "create", 
                $(groupSelector), 
                "inside", 
                { 
                    "data": {
                         "title": resource.name, 
                         "attr": {
                             "id": resource.name, 
                             "class": "current_item_link"
                         } 
                    }, 
                    "attr": {"id": resource.name + "_container"},
                    "metadata": {"name": resource.name, "parent_tree": "#template_resources"} 
                } 
            );
            
            Common.vent.trigger("project:addResource", resource);
            return false;
        },
        
        selectResource: function(e) {
            Common.vent.trigger("project:selectResource", e.currentTarget.id);
            return false;
        },
        
        renameResource: function(e) {
            this.selectResource(e);
            var selector = "#" + e.currentTarget.parentNode.id;
            this.tree.jstree("rename", selector);
            return false;
        },
        
        handleRename: function(e, object) {
            var resourceName = object.args[1];
            Common.vent.trigger("project:renameResource", resourceName);
        },
        
        openAll: function() {
            this.tree.jstree("open_all");
        },
        
        collapseAll: function() {
            this.tree.jstree("close_all");
        }
        
    });
    
    return ProjectNewResourcesListView;
});
