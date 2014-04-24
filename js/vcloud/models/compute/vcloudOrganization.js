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
	'models/resource/resourceModel'
], function ( $, _, Backbone, Common, ResourceModel ) {
	var VCloudOrganization = ResourceModel.extend({
		
		defaults : {
			id : '',
			name : ''
		},

		apiUrl : Common.apiUrl + "stackstudio/v1/cloud_management/vcloud/compute/organizations",

		create : function ( credentialId, options ) {
			var ajaxOptions = {
				cred_id : credentialId,
				"organization" : options
			};
			this.sendAjaxAction(this.apiUrl, "POST", ajaxOptions);
		}
	});

	return VCloudOrganization;
});