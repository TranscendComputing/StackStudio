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
	'/js/vcloud/collections/vcloudCollection.js',
	'/js/vcloud/models/catalog/vcloudCatalogItem.js'
], function ( Backbone, Common, VCloudCollection, VCloudCatalogItem ) {
	'use strict';

	var CatalogItems = VCloudCollection.extend({

		initialize : function ( options ) {
			this.catalog = options.catalog;

			VCloudCollection.prototype.initialize.call(this, options);
		},
		
		model : VCloudCatalogItem,

		url : Common.apiUrl + '/stackstudio/v1/cloud_management/vcloud/catalog_items'

	});

	return CatalogItems;
});