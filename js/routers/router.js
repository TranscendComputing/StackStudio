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

	if(window.app === "stackplace") {
	    Backbone.Router.namedParameters = true;
	}else {
	    Backbone.Router.namedParameters = false;
	}

	var Router = Backbone.Router.extend({

		routes:{
            'account/cloudcredentials': 'cloudCredentials',
            'account/management(/:action)': 'accountManagementRoute',
			'resources': 'resourcesRoute',
			'resources/:cloud': 'resourcesRoute',
			'resources/:cloud/:region': 'resourcesRoute',
			'resources/:cloud/:region/:type': 'resourcesRoute',
			'resources/:cloud/:region/:type/:subtype' : 'resourcesRoute',
			'resources/:cloud/:region/:type/:subtype/:id': 'resourcesRoute',
			'images': 'imagesRoute',
            'images/:id': 'imagesRoute',
            'assemblies': 'assembliesRoute',
            'platform_components': 'platformComponentsRoute',
            'stacks': 'stacksRoute',
            'offerings': 'offeringsRoute',
			'projects': 'projects',
			'project/new': 'projectCreate',
			'projects/:url': 'projectEdit',
			'open?:url': 'loadTemplate',
			'projects/:id/update/:resource': 'projectUpdate',
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
                $(".main-nav a").removeClass("nav_selected");
                $("#dashboard_nav").addClass("nav_selected");
                this.trigger("route:dashboard");
		    }
		},

		resourcesRoute: function(cloud, region, type, subtype, id, action) {
		    $("#sidebar").empty();
		    $("#sidebar").hide();
            $(".main-nav a").removeClass("nav_selected");
            $("#resources_nav").addClass("nav_selected");
		    this.trigger("route:resources", cloud, region, type, subtype, id);
		},

		imagesRoute: function(action) {
            $("#sidebar").empty();
            $("#sidebar").hide();
            $(".main-nav a").removeClass("nav_selected");
            $("#images_nav").addClass("nav_selected");
            this.trigger("route:images", action);
        },

		assembliesRoute: function(action) {
            $("#sidebar").empty();
            $("#sidebar").hide();
            $(".main-nav a").removeClass("nav_selected");
            $("#assemblies_nav").addClass("nav_selected");
            this.trigger("route:assemblies");
        },

        platformComponentsRoute: function(action) {
            $("#sidebar").empty();
            $("#sidebar").hide();
            $(".main-nav a").removeClass("nav_selected");
            $("#platform_nav").addClass("nav_selected");
            this.trigger("route:platformComponents");
        },

        stacksRoute: function(action) {
            $("#sidebar").empty();
            $("#sidebar").hide();
            $(".main-nav a").removeClass("nav_selected");
            $("#stacks_nav").addClass("nav_selected");
            this.trigger("route:stacks");
        },

        offeringsRoute: function(action) {
            $("#sidebar").empty();
            $("#sidebar").hide();
            $(".main-nav a").removeClass("nav_selected");
            $("#offerings_nav").addClass("nav_selected");
            this.trigger("route:offerings");
        },

        accountManagementRoute: function(action) {
        	$("#sidebar").empty();
            $("#sidebar").hide();
            $(".main-nav a").removeClass("nav_selected");
            $("#nav_account").addClass("nav_selected");
            this.trigger("route:accountManagement", action);
        }
	});

	return Router;
});
