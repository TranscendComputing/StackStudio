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
        'wijmo'
], function( $, _, Backbone, Common ) {
       
    var ProjectCurrentResourcesListView = Backbone.View.extend({
        
        //TODO define element
        //OR use tagName, className, ...
        el: "#current_resource_list",
        
        initialize: function(){
            //Common.vent.on('project:addResource', this.addResource, this);
            this.render();
        },
        
        render: function() {
            this.$el.wijlist({
                autoSize: true,
                superPanelOptions: {
                    autoRefresh: true
                }
            });
            return this;
        },
        
        // Add a single instance item to the list by creating a view for it.
        addResource: function(resource) {
            this.$el.wijlist("addItem", {label: resource.name, value: resource.template}); 
            //Render the list in the client browser
            this.$el.wijlist('renderList');
            this.$el.wijlist('refreshSuperPanel');
            //$("#sidebar").height($("#ap_container").height());
            //$("#hsplitter").height($("#sidebar").height());
            //$("#hsplitter").wijsplitter("refresh");
        }
        
    });
    
    return ProjectCurrentResourcesListView;
});
