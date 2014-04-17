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
	'Backbone',
	'common',
	'models/resource/resourceModel'
], function ( $, _, Backbone, common, ResourceModel ) {
	var VCloudVm = ResourceModel.extend({
		
		defaults : {
			id : '',
			name : '',
			network_interfaces : ''
		},

		apiUrl : Common.apiUrl + "stackstudio/v1/cloud_management/vcloud/compute/vms" 

		create : function ( credentialId, options ) {
			var ajaxOptions = {
				cred_id : credentialId,
				"instance" : options
			};
			this.sendAjaxAction(this.apiUrl, "POST", ajaxOptions);
		},

		delete: function ( credentialId, region ) {
			this.sendAjaxAction(this.apiUrl, "POST", { cred_id : credentialId }, "instanceAppRefresh");
		} 
	});

	return VCloudVm;
});