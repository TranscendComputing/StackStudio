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
        'views/templatesListView',
        'icanhaz',
        'common',
        'wijmo'
], function( $, _, Backbone, sidebarTemplate, projects, resources, ProjectNewResourcesListView, ProjectCurrentResourcesListView, TemplatesListView, ich, Common ) {
    
    var SidebarView = Backbone.View.extend({
        el: "#sidebar",
        
        newResourcesList: new ProjectNewResourcesListView(),
        
        currentResourcesList: new ProjectCurrentResourcesListView(),
        
        templatesList: new TemplatesListView(),

        events: {
            //No events
        },
        
        template: _.template(sidebarTemplate),
        
        initialize: function(){
            //TODO
        },
        
        render: function() {
            this.$el.html(this.template);
            this.$el.addClass("fourcol");
            //Set horizontal splitter
            this.$(".accordion").accordion({
                "heightStyle": "content"
            });
            this.newResourcesList.render();
            //this.currentResourcesList.render();
            this.templatesList.render();
            return this;
        }      
    });
    
    var projectSidebar;

    Common.router.on('route:projectEdit', function (id) {
        console.log("Editor route");
        if ( !projectSidebar ) {
            projectSidebar = new SidebarView();
        }
        projectSidebar.render();
        console.log("Got project resource sidebar route.");
    }, this);
    
    return SidebarView;
});
