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
        'common'
], function( $, _, Backbone, resources, ProjectNewResourceListItemView, Common ) {
       
    var ProjectNewResourcesListView = Backbone.View.extend({
        
        //TODO define element
        //OR use tagName, className, ...
        el: "#aws_resources",
        
        initialize: function(){
            resources.on( 'add', this.addOne, this );
            resources.on( 'reset', this.addAll, this );
            resources.on( 'all', this.render, this );
            
            // Fetch will pull results from the server
            resources.fetch({update: true});
        },
        
        render: function() {

        },
        
        // Add a single instance item to the list by creating a view for it.
        addOne: function( resource ) {
            var projectNewResourceListItemView = new ProjectNewResourceListItemView({ model: resource });
            this.$el.append(projectNewResourceListItemView.render().el);
        },

        // Add all items in the **Projects** collection at once.
        addAll: function() {
            resources.each(this.addOne, this);
        }
        
    });
    
    return ProjectNewResourcesListView;
});
