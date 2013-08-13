/*!
 * (c) Copyright 2012-2013 Transcend Computing, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an AS IS BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
        
        events: {
            'click #new_project': 'createNew'
        },
        
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
