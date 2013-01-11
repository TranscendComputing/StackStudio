/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
define([
        'jquery',
        'backbone',
        'common'
], function( $, Backbone, Common ) {
	'use strict';

    /**
     * Router the central dispatcher for matching URLs to code.
     *
     * @name Router
     * @constructor
     * @category Core
     * @param {Object} initialization object.
     * @returns {Object} Returns a Router instance.
     */
	var Router = Backbone.Router.extend({
		routes:{
			'resources': 'resourcesRoute',
			//'resources/:type(/:id)': 'resourcesRoute',
			'resources/instances/:id': 'instanceDetail',
			'projects': 'projects',
			//'projects': 'projectsRoute',
			//'projects/:id': 'projectsRoute',
			'projects/:id': 'projectDetail',
			'project/new': 'projectCreate',
			'projects/:id/edit': 'projectEdit',
			//'projects/:id(/:action)': 'projectsRoute',
			'projects/:id/update/:resource': 'projectUpdate',
			'*actions': 'defaultRoute'
		},
		
		defaultRoute: function( actions ) {
		    $("#sidebar").empty();
		    $("#sidebar").hide();
			$("#main").load('/dashboard.html');
			console.log("Running default route.  Dashboard");
		},
		
		projectsRoute: function(id, action) {
		    $("#sidebar").show();
		    $("#main").empty();
		    if (!id) {
		        this.trigger('route:projects');
		    } else {
    		    this.trigger('projects:' + action, id);
		    }
		},
		
		resourcesRoute: function(type, id, action) {
		    $("#sidebar").empty();
		    $("#sidebar").hide();
		    $("#main").empty();
		    switch (type)
		    {
		        case 'instances':
	              if (!id) {
                      this.trigger('route:instances');
                  } else {
                      this.trigger('route:instanceDetail', id);
                  }
	              break;
		                 
		    }
		    
		    if (!type) {
		        this.trigger('route:resources');
		    }
		    
		}
	});
	
	return Router;
});
