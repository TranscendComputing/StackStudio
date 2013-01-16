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
			'resources': 'resources',
			'resources/instances': 'instances',
			'resources/instances/:id': 'instanceDetail',
			'projects': 'projects',
			'projects/:id': 'projectDetail',
			'projects/:id/edit': 'projectEdit',
			'projects/:id/update/:resource': 'projectUpdate',
			'*actions': 'defaultRoute'
		},
		
		defaultRoute: function( actions ) {
			$("#main").load('/dashboard.html');
			console.log("Running default route.  Dashboard");
		}
	});
	
	return Router;
});
