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
	'vcloud/collections/vcloudCollection',
	'vcloud/models/compute/vcloudVm'
], function ( Backbone, Common, VCloudCollection, VCloudVm ) {
	'use strict';

	var Vms = VCloudCollection.extend({
		
		model : VCloudVm,

		url : Common.apiUrl + '/stackstudio/v1/cloud_management/vcloud/compute/vms'
	});

	return Vms;
});
