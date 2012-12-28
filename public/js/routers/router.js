/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
define([
        'jquery',
        'backbone',
        'collections/instances',
        'common'
], function( $, Backbone, Instances, Common ) {
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
			'instance/:id': 'instanceDetail',
			'projects/:id': 'projectDetail',
			'*actions': 'defaultRoute'
		},

		defaultRoute: function( actions ) {
			console.log("Running default route.  Dashboard?");
		}
	});

	return Router;
});
