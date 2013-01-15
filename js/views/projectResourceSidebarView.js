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
        'views/projectNewResourcesListView',
        'views/projectCurrentResourcesListView',
        'icanhaz',
        'common',
        'wijmo'
], function( $, _, Backbone, sidebarTemplate, projects, resources, ProjectNewResourcesListView, ProjectCurrentResourcesListView, ich, Common ) {
    
    var SidebarView = Backbone.View.extend({
        el: "#sidebar",

        events: {
            //No events
        },
        
        template: _.template(sidebarTemplate),
        
        initialize: function(){
            this.render();
            //Initialize resources list
            new ProjectNewResourcesListView();
            new ProjectCurrentResourcesListView();
        },
        
        render: function() {
            this.$el.html(this.template);
            this.$el.addClass("fourcol");
            //Set horizontal splitter
            /*
            $("#hsplitter").wijsplitter({
                 orientation: "horizontal",
                 fullSplit: true,
                 resizeSettings: {ghost: false},
                 splitterDistance: 150, 
                 panel1: {
                      minSize:400, 
                      collapsed:false, 
                      scrollBars:"auto"
                 },
                 panel2: {
                      minSize:400, 
                      scrollBars:"auto"
                 }
                 
            });
            */
            return this;
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
