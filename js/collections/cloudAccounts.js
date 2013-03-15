/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true alert:true*/
define([
        'jquery',
        'backbone',
        'models/cloudAccount',
        'common'
], function( $, Backbone, CloudAccount, Common ) {
	'use strict';

	// Cloud Account Collection
	// ---------------

	var CloudAccountList = Backbone.Collection.extend({

		// Reference to this collection's model.
		model: CloudAccount,
        url: Common.apiUrl + '/stackstudio/v1/cloud_accounts',
        /** Parse the object to get wrapped item */
        parse: function(resp) {
            return resp.cloud_accounts;
        }
	
	});

	return CloudAccountList;

});
