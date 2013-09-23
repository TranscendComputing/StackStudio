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
        'common'
], function( $, _, Backbone, sidebarTemplate, ProjectsListView, Common ) {
    
    var SidebarView = Backbone.View.extend({
        el: "#sidebar",
        
        template: _.template(sidebarTemplate),
        
        events: {
            'click #new_project': 'createNew'
        },
        
        initialize: function(){
            this.render();
        },
        
        render: function() {
            this.$el.html(this.template);
            
            this.$el.addClass("threecol");
            $(".accordion").accordion({
                header: "h3",
                requireOpenedPane: false
            });
            
            //initialize projects list
            new ProjectsListView();
            this.$el.height($("#ap_container").height());
        },
        
        createNew: function() {
            Common.vent.trigger('project:createNew');
            return false;
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
        }
    }, this);
    return SidebarView;
});
