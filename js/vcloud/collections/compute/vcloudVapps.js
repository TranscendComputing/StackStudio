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
	'/js/vcloud/models/compute/vcloudVapp.js'
], function ( Backbone, Common, VCloudVapp ) {
	'use strict';

	var Vapps = Backbone.Collection.extend({

		model : VCloudVapp,

		initialize : function ( options ) {
			this.url = Common.apiUrl + '/stackstudio/v1/cloud_management/vcloud/compute/data_centers/' + encodeURIComponent(options.vdc_id) + '/vapps';
			Backbone.Collection.prototype.initialize.call(this);
			this.cred_id = options.cred_id;
		},

		fetch : function ( options ) {
			options = options || {};
			options.data = options.data || {};
			options.data.cred_id = this.cred_id;
			
			Backbone.Collection.prototype.fetch.call(this, options);
		} 
		
	});

	return Vapps;
});