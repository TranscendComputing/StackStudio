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
        'text!templates/projects/projectResourceSidebarTemplate.html',
        'collections/projects',
        'collections/template_resources',
        'icanhaz',
        'common',
        'wijmo'
], function( $, _, Backbone, sidebarTemplate, projects, resources, ich, Common ) {
    
    var SidebarView = Backbone.View.extend({
        el: "#sidebar",

        events: {
            'click .resource_link': 'addResource'
        },
        
        initialize: function(){
            var compiledTemplate = _.template(sidebarTemplate);
            
            this.$el.html(compiledTemplate);
            this.$el.addClass("threecol");
            //Set horizontal splitter
            $("#hsplitter").wijsplitter({
                 orientation: "horizontal",
                 resizeSettings: {ghost: false},
                 splitterDistance: 150, 
                 panel1: {
                      minSize:150, 
                      collapsed:false, 
                      scrollBars:"auto"
                 },
                 panel2: {
                      minSize:200, 
                      scrollBars:"auto"
                 }
                 
            });
            
                        
            resources.on( 'add', this.addOne, this );
            resources.on( 'reset', this.addAll, this );
            resources.on( 'all', this.render, this );
            

            // Fetch will pull results from the server
            resources.fetch();
        },
        
        render: function() {
          //Nothing to render  
        },
        
        // Add a single instance item to the list by creating a view for it.
        addOne: function( resource ) {
            console.log("Got another resource!");
            if (resource.get('type') === "") {
                // Refuse to add resources until they're initialized.
                return;
            }

            $("#aws_resources").append(ich.resource_item(resource.attributes));
        },

        // Add all items in the **TemplateResources** collection at once.
        addAll: function() {
            resources.each(this.addOne, this);
        },
        
        addResource: function() {
            console.log("Adding new resource");
        }        
    });
    
    var projectSidebar;

    Common.router.on('route:projectEdit', function (id) {
        console.log("Editor route");
        if ( !projectSidebar ) {
            projectSidebar = new SidebarView();
        }
        projects.each(function(e){
           if (e.get('id') === id) {
               projectSidebar.selectedProject = e;
           }
        });
        console.log("Got project resource sidebar route.");
    }, this);
    
    return SidebarView;
});
