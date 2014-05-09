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
	var VCloudVapp = ResourceModel.extend({
		
		defaults : {
			name : ''
		},
		idAttribute : 'name',

		getVms : function ( cb ) {
			$.ajax({
				type : 'GET',
				url : Common.apiUrl + '/stackstudio/v1/cloud_management/vcloud/compute/data_centers/' + encodeURIComponent(this.attributes.vdc) + '/vapps/' + encodeURIComponent(this.attributes.name) + '/vms',
				data : {
					cred_id : this.attributes.cred_id
				},
				success : function ( results ) {
					Common.vent.trigger('vcloudAppRefresh', results);
				},
				error : function ( err ) {
					console.log(err);
				}
			});
		}
	});

	return VCloudVapp;
});