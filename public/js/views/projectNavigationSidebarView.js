/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
define([
        'jquery',
        'underscore',
        'backbone',
        'text!templates/projects/projectsNavSidebarTemplate.html',
        'collections/projects',
        'common'
], function( $, _, Backbone, sidebarTemplate, projects, Common ) {
    
    var SidebarView = Backbone.View.extend({
        el: "#sidebar",
        
        render: function(){
            var compiledTemplate = _.template( sidebarTemplate);
            
            this.el.append(compiledTemplate);
        }
    });
    
    return SidebarView;
});
