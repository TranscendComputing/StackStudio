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
            'account/management(/:action)': 'accountManagement',
			'resources': 'resourcesRoute',
			'resources/:cloud': 'resourcesRoute',
			'resources/:cloud/:region': 'resourcesRoute',
			'resources/:cloud/:region/:type': 'resourcesRoute',
			'resources/:cloud/:region/:type/:subtype' : 'resourcesRoute',
			'resources/:cloud/:region/:type/:subtype/:id': 'resourcesRoute',
            'apps': 'appsRoute',
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
                this.trigger("route:dashboard");
		    }
		},

		resourcesRoute: function(cloud, region, type, subtype, id, action) {
		    $("#sidebar").empty();
		    $("#sidebar").hide();
		    this.trigger("route:resources", cloud, region, type, subtype, id);
		},

		appsRoute: function(action) {
            $("#sidebar").empty();
            $("#sidebar").hide();
            this.trigger("route:apps");
        }
	});

	return Router;
});
