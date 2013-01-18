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
        },
        
        render: function() {
            this.tree = $("#current_outline").jstree({ 
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
                    "data": [
                        {
                            "data": {
                                "title": "Resources"
                            },
                            "attr": {"id": "current_resources"},
                            "state": "closed"   
                        },
                        {
                            "data": {
                                "title": "Parameters"
                            },
                            "attr": {"id": "current_parameters"},
                            "state": "closed"
                        },
                        {
                            "data": {
                                "title": "Mappings"
                            },
                            "attr": {"id": "current_mappings"},
                            "state": "closed"
                        },
                        {
                            "data": {
                                "title": "Outputs"
                            },
                            "attr": {"id": "current_outputs"},
                            "state": "closed"
                        }
                    ],
                    "correct_state": false
                }
            });
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
