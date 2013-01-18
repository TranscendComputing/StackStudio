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
			'resources/:type': 'resourcesRoute',
			'resources/:type/:id': 'resourcesRoute',
			//'resources/:type': 'resourcesRoute',
			//'resources/:type/:id': 'resourcesRoute',
			'projects': 'projects',
			//'projects': 'projectsRoute',
			//'projects/:id': 'projectsRoute',
			//'projects/:id': 'projectDetail',
			'project/new': 'projectCreate',
			'projects/edit': 'projectEdit',
			//'projects/:id(/:action)': 'projectsRoute',
			'projects/:id/update/:resource': 'projectUpdate',
			'account/login': 'accountLogin',
			'*actions': 'defaultRoute'
		},
		
		defaultRoute: function( actions ) {
		    if (window.app === "stackplace") {
		        this.trigger('route:projectEdit');
		    } else {
    		    $("#sidebar").empty();
                $("#sidebar").hide();
                $("#main").load('/dashboard.html');
                console.log("Running default route.  Dashboard");    
		    }
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
		    
		    if(type) {
		    	switch (type)
			    {
			        case 'compute':
			        	if(!id) {
			        		this.trigger('route:compute');
			        	}else {
			        		this.trigger('route:computeDetail', id);
			        	}
			        break;
			                 
			    }
		    }else {
		    	this.trigger('route:resources');
		    }		    
		}
	});
	
	return Router;
});
