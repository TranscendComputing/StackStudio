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
        'text!templates/projects/projectsNavSidebarTemplate.html',
        'collections/projects',
        'icanhaz',
        'common',
        'wijmo'
], function( $, _, Backbone, sidebarTemplate, projects, ich, Common ) {
    
    var SidebarView = Backbone.View.extend({
        el: "#sidebar",
        
        /** Delegated events */
        events: {
            'dblclick .projlink' : 'openProject'
        },
        
        initialize: function(){
            var compiledTemplate = _.template(sidebarTemplate);
            
            this.$el.html(compiledTemplate);
            $(".accordion").wijaccordion({
                header: "h3",
                requireOpenedPane: false
            });
            
            projects.on( 'add', this.addOne, this );
            projects.on( 'reset', this.addAll, this );
            projects.on( 'all', this.render, this );
            

            // Fetch will pull results from the server
            projects.fetch();
            
        },
        
        render: function() {
          //Nothing to render  
        },
        
        // Add a single instance item to the list by creating a view for it.
        addOne: function( project ) {
            console.log("Got another project!");
            if (project.get('id') === "") {
                // Refuse to add projects until they're initialized.
                return;
            }

            $("#my_projects").append(ich.project_item(project.attributes));
        },

        // Add all items in the **Projects** collection at once.
        addAll: function() {
            projects.each(this.addOne, this);
        },
        
        openProject : function () {
            console.log("This will open the project for editing...");
        }
    });
    
    var projectSidebar;
    
    Common.router.on('route:projects', function (id) {
        if (!projectSidebar) {
            projectSidebar = new SidebarView();
        }
        console.log("Got project detail route.");
    }, this);
    
    return SidebarView;
});
