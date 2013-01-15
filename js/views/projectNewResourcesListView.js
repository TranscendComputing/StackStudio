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
        el: "#new_resources",
        
        events: {
            'click .jstree-leaf': 'addResource'
        },
        
        initialize: function(){
            resources.on( 'add', this.addOne, this );
            resources.on( 'reset', this.addAll, this );
            resources.on( 'all', this.render, this );
            this.render();
            // Fetch will pull results from the server
            // resources.fetch({update: true});
        },
        
        render: function() {
            console.log("rendering tree...");
            this.$el.jstree({ 
                // List of active plugins
                "plugins" : [ 
                    "themes","json_data"
                ],
    
                // I usually configure the plugin that handles the data first
                // This example uses JSON as it is most common
                "json_data" : { 
                    "data": {
                        "data": "AWS Resources",
                        "state": "open"
                    },
                    "ajax": {
                        "url": "cloud_resources.json",
                        "success": function(data) {
                            console.log(data);
                            var services = {};
                            $.each(data, function(index, d) {
                                 if (services[d.service] !== undefined) {
                                     services[d.service].push({
                                         data: d.label,
                                         metadata: {template: d.template, name: d.name},
                                         attr: {id: d.name}
                                     });
                                 } else {
                                     services[d.service] = [{
                                         data: d.label,
                                         metadata: {template: d.template, name: d.name},
                                         attr: {id: d.name}
                                     }];
                                 }
                            });
                            
                            var treeData = [];
                            $.each(services, function(s, v) {
                                treeData.push({
                                    data: s,
                                    children: v
                                });
                            });
                            return treeData;
                            //return data.label;
                        }
                    }
                }
            });
        },
        
        // Add a single instance item to the list by creating a view for it.
        addOne: function( resource ) {
            console.log("adding " + resource.get('label'));
            var projectNewResourceListItemView = new ProjectNewResourceListItemView({ model: resource });
            this.$el.append(projectNewResourceListItemView.render().el);
        },

        // Add all items in the **Projects** collection at once.
        addAll: function() {
            resources.each(this.addOne, this);
        },
        
        addResource: function(e) {
            var selector = "#" + e.currentTarget.id;
            var resource = $(selector).data();
            console.log(resource);
            Common.vent.trigger("project:addResource", resource);
            return false;
        }
        
    });
    
    return ProjectNewResourcesListView;
});
