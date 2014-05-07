/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
define([
	'jquery',
	'underscore',
	'backbone',
	'common',
	'models/resource/resourceModel',
	'mixins'
], function ( $, _, Backbone, Common, ResourceModel ) {
	var VCloudVm = ResourceModel.extend({
		
		defaults : {
			cred_id : ''
		},

		apiUrl : Common.apiUrl + "/stackstudio/v1/cloud_management/vcloud/compute/vms",

		initialize : function ( options ) {
			this.id = this.attributes.name;
			this.vdc = this.attributes.vdc;
			this.vapp = this.attributes.vapp;
			this.cred_id = this.collection.options.cred_id;
		},

		powerOff : function () {
			var ajaxOptions = {
				"cred_id" : this.cred_id,
				"id" : this.id,
				"vdc" : this.vdc,
				"vapp" : this.vapp
			};
			this.sendAjaxAction(this.apiUrl + "/power_off", "POST", ajaxOptions, "vmAppRefresh");
		},

		powerOn : function () {
			var ajaxOptions = {
				"cred_id" : this.cred_id,
				"id" : this.id,
				"vdc" : this.vdc,
				"vapp" : this.vapp
			};
			this.sendAjaxAction(this.apiUrl + "/power_on", "POST", ajaxOptions, "vmAppRefresh");
		},

		modifyCpu : function ( cpuValue ) {
			var ajaxOptions = {
				"cred_id" : this.cred_id,
				"id" : this.id,
				"vdc" : this.vdc,
				"vapp" : this.vapp,
				"cpu" : cpuValue
			};

			this.sendAjaxAction(this.apiUrl + "/modify_cpu", "POST", ajaxOptions, "vmAppRefresh");
		},

		modifyMemory : function ( memValue ) {
			var ajaxOptions = {
				"cred_id" : this.cred_id,
				"id" : this.id,
				"vdc" : this.vdc,
				"vapp" : this.vapp,
				"memory" : memValue
			};
			this.sendAjaxAction(this.apiUrl + "/modify_memory", "POST", ajaxOptions, "vmAppRefresh");
		},

		loadNetwork : function () {
			var ajaxOptions = {
				"cred_id" : this.cred_id,
				"id" : this.id,
				"vdc" : this.vdc,
				"vapp" : this.vapp
			};

			this.sendAjaxAction(this.apiUrl + "/network", "GET", ajaxOptions, "networkLoaded");
		},

		updateNetwork : function ( options ) {
			var refinedOptions = _.refine(options);
			var ajaxOptions = _.extend(refinedOptions, {
				cred_id : this.cred_id,
				vdc : this.vdc,
				vapp : this.vapp,
				id : this.id
			});

			this.sendAjaxAction(this.apiUrl + "/network", "POST", ajaxOptions, "networkRefresh");
		},

		loadDisks : function () {
			var ajaxOptions = {
				"cred_id" : this.cred_id,
				"id" : this.id,
				"vdc" : this.vdc,
				"vapp" : this.vapp
			};
			this.sendAjaxAction(this.apiUrl + "/disks", "GET", ajaxOptions, "disksLoaded");
		}
	});

	return VCloudVm;
});