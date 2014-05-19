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
	'vcloud/models/catalog/vcloudCatalog'
], function ( Backbone, Common, VCloudCatalog ) {
	'use strict';

	var Catalogs = Backbone.Collection.extend({
		
		model : VCloudCatalog,

		url : Common.apiUrl + '/stackstudio/v1/cloud_management/vcloud/catalogs'

	});

	return Catalogs;
});
