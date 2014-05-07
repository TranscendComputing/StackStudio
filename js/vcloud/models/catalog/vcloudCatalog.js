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

		get_items : function ( cred_id ) {
			var ajaxOptions = {
				cred_id : cred_id
			};
		}
	});

	return VCloudCatalog;
});