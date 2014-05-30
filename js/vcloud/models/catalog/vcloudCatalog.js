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
	var VCloudCatalog = ResourceModel.extend({
		
		defaults : {
			name : ''
		},

		instantiateVapp : function ( options ) {
			var url = Common.apiUrl + '/stackstudio/v1/cloud_management/vcloud/catalogs/' + options.cat_id + '/items/' + options.item_id + '/vapp?cred_id=' + options.cred_id;
			$.ajax({
				type : 'POST',
				url : url,
				data : {
					cred_id : options.cred_id,
					vapp_name : options.vapp_name,
					vapp_options : options.vapp_options
				},
				success: function ( result ) {
					console.log(result);
				}
			});
		}
	});

	return VCloudCatalog;
});