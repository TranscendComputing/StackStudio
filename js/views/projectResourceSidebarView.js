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
        'icanhaz',
        'common',
        'wijmo'
], function( $, _, Backbone, sidebarTemplate, projects, ich, Common ) {
    
    var SidebarView = Backbone.View.extend({
        el: "#sidebar",
        
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
            
        },
        
        render: function() {
          //Nothing to render  
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
