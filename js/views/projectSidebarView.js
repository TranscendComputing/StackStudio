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
        'views/projectsListView',
        'common',
        'wijmo'
], function( $, _, Backbone, sidebarTemplate, ProjectsListView, Common ) {
    
    var SidebarView = Backbone.View.extend({
        el: "#sidebar",
        
        template: _.template(sidebarTemplate),
        
        initialize: function(){
            this.render(); 
        },
        
        render: function() {
            this.$el.html(this.template);
            
            this.$el.addClass("threecol");
            $(".accordion").wijaccordion({
                header: "h3",
                requireOpenedPane: false
            });
            
            //initialize projects list
            new ProjectsListView();
        }       
    });
    
    var projectSidebarView;
    
    Common.router.on('route:projects', function () {
        if ( !projectSidebarView ) {
            projectSidebarView = new SidebarView();
        }
    }, this);
    
    Common.router.on('route:projectDetail', function (id) {
        if ( !projectSidebarView ) {
            projectSidebarView = new SidebarView();
        } else {
            projectSidebarView.render();
        }
    }, this);
    return SidebarView;
});
