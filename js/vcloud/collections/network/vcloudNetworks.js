/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
define([
	'backbone',
	'common',
	'vcloud/models/network/vcloudNetwork'
], function ( Backbone, Common, VCloudNetwork ) {
	'use strict';

	var Networks = Backbone.Collection.extend({
		
		model : VCloudNetwork,

		url : Common.apiUrl + '/stackstudio/v1/cloud_management/vcloud/networks/'
	});

	return Networks;
});
