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
	'vcloud/models/compute/vcloudVm'
], function ( Backbone, Common, VCloudVm ) {
	'use strict';

	var Vms = Backbone.Collection.extend({
		
		model : VCloudVm,

		url : Common.apiUrl + '/stackstudio/v1/cloud_management/vcloud/compute/vms',

		initialize : function ( options ) {
			if(!(options && options.vdc_id && options.vapp_id)) {
				Backbone.Collection.prototype.initialize.call(this);
			}

			this.options = options;
			this.url = Common.apiUrl + '/stackstudio/v1/cloud_management/vcloud/compute/data_centers/' + options.vdc_id + '/vapps/' + options.vapp_id + '/vms?cred_id=' + options.cred_id;
			Backbone.Collection.prototype.initialize.call(this, options);
		}
	});

	return Vms;
});
