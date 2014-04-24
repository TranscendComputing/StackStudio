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
	'/js/vcloud/models/compute/vcloudOrganization.js'
], function ( $, Backbone, Common, VCloudOrganization ) {
	'use strict';

	var Organizations = Backbone.Collection.extend({
		
		model : VCloudOrganization,

		url : Common.apiUrl + '/stackstudio/v1/cloud_management/vcloud/compute/organizations'

	});

	return Organizations;
});