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
        'collections/projects',
        'views/projectListItemView',
        'common'
], function( $, _, Backbone, projects, ProjectListItemView, Common ) {
       
    var ProjectsListView = Backbone.View.extend({
        
        //TODO define element
        //OR use tagName, className, ...
        el: "#my_projects",
        
        //TODO define template
        //template: _.template(),
        
        //events: {
            //TODO handle events
        //},
        
        
        initialize: function(){
            projects.on( 'add', this.addOne, this );
            projects.on( 'reset', this.addAll, this );
            projects.on( 'all', this.render, this );
            
            // Fetch will pull results from the server
            projects.fetch({update: true});
        },
        
        render: function() {

        },
        
        // Add a single instance item to the list by creating a view for it.
        addOne: function( project ) {
            if (project.get('id') === "") {
                // Refuse to add projects until they're initialized.
                return;
            }
            var projectListItemView = new ProjectListItemView({ model: project });
            this.$el.append(projectListItemView.render().el);
            
            // Trigger event to select project if necessary
            if (selectedId && project.get('id') === selectedId) {
                console.log(Common.vent);
                Common.vent.trigger('project:show', project);
            }
        },

        // Add all items in the **Projects** collection at once.
        addAll: function() {
            projects.each(this.addOne, this);
        }
        
    });
    
    var selectedId;
    
    Common.router.on('route:projectDetail', function (id) {
        selectedId = id;
    }, this);
    
    return ProjectsListView;
});
