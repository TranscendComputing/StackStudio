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
        'common',
        'backbone.queryparams'
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
    Backbone.Router.namedParameters = true;
    
	var Router = Backbone.Router.extend({
	    namedParameters: true,
	    
		routes:{
			'resources': 'resourcesRoute',
			'resources/:cloud': 'resourcesRoute',
			'resources/:cloud/:type': 'resourcesRoute',
			'resources/:cloud/:type/:id': 'resourcesRoute',
			//'resources/:type': 'resourcesRoute',
			//'resources/:type/:id': 'resourcesRoute',
			'projects': 'projects',
			//'projects': 'projectsRoute',
			//'projects/:id': 'projectsRoute',
			//'projects/:id': 'projectDetail',
			'project/new': 'projectCreate',
			'projects/:url': 'projectEdit',
			'open?:url': 'loadTemplate',
			//'projects/:id(/:action)': 'projectsRoute',
			'projects/:id/update/:resource': 'projectUpdate',
			'account/login': 'accountLogin',
			'*actions': 'defaultRoute'
		},
		
		defaultRoute: function( actions ) {
		    if (window.app === "stackplace") {
		        if ( (typeof actions === 'object') && (actions.url !== undefined) ) {
		            this.trigger('route:projectEdit', actions.url);
		        } else {
		          this.trigger('route:projectEdit');
		        }
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
		
		resourcesRoute: function(cloud, type, id, action) {
		    $("#sidebar").empty();
		    $("#sidebar").hide();
		    $("#main").empty();
		    
		    this.trigger("route:resources", cloud, type, id);
		    /*
		    if(cloud) {
		        if(type) {
		            switch(type)
		            {
		                case "compute":
		                    if(id) {
		                        this.trigger("route:computeDetail", cloud, type, id);
		                    }else {
		                        this.trigger("route:compute", cloud, type);
		                    }
		                    break;
		            }
		                
		        }else {
		            this.trigger("route:resources", cloud);
		        }
		    }else {
		        this.trigger("route:resources");
		    }	
		    */    
		}
	});
	
	return Router;
});
