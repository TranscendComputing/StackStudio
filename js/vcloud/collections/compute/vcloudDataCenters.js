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
<<<<<<< HEAD
	'vcloud/collections/vcloudCollection',
	'vcloud/models/compute/vcloudDataCenter'
], function ( Backbone, Common, VCloudCollection, VCloudDataCenter ) {
=======
	'/js/vcloud/models/compute/vcloudDataCenter.js'
], function ( Backbone, Common, VCloudDataCenter ) {
>>>>>>> cloud_management_refactor
	'use strict';

	var DataCenters = Backbone.Collection.extend({
		
		model : VCloudDataCenter,

		url : Common.apiUrl + '/stackstudio/v1/cloud_management/vcloud/compute/data_centers'
	});

	return DataCenters;
});
