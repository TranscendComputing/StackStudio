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
        'models/cloudCredential',
        'common'
], function( $, Backbone, CloudCredential, Common ) {
	'use strict';

	// Cloud Credential Collection
	// ---------------

	var CloudCredentialList = Backbone.Collection.extend({

		// Reference to this collection's model.
		model: CloudCredential,

		fetch: function(options) {
		    var cloudCreds = [];
		    if(sessionStorage.cloud_accounts) {
		        var cloudCredentials = JSON.parse(sessionStorage.cloud_accounts);
		        $.each(cloudCredentials, function(index, value) {
		            var cloudCred = new CloudCredential(value.cloud_account);
		            cloudCreds.push(cloudCred);
		        });
		    }
		    
		    this.reset(cloudCreds);
		},
		
		create: function(model, options) {
		    var url = Common.apiUrl + "/identity/v1/accounts/" + sessionStorage.account_id + "/" + model.attributes.cloud_id + "/cloud_accounts";
		    var cloudCredential = {"cloud_account": model.attributes};
		    $.ajax({
                url: url,
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                data: JSON.stringify(cloudCredential),
                success: function(data) {
                    sessionStorage.cloud_accounts = JSON.stringify(data.account.cloud_accounts);
                    Common.vent.trigger("cloudCredentialCreated");
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            });
		},
		
		update: function(model, options) {
		    var url = Common.apiUrl + "/identity/v1/accounts/" + sessionStorage.account_id + "/cloud_accounts/" + model.attributes.id + "?_method=PUT";
		    var cloudCredential = {"cloud_account": model.attributes};
		    $.ajax({
                url: url,
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                data: JSON.stringify(cloudCredential),
                success: function(data) {
                    sessionStorage.cloud_accounts = JSON.stringify(data.account.cloud_accounts);
                    Common.vent.trigger("cloudCredentialUpdated");
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            });
		},
		
		deleteCredential: function(cloudCredentialId) {
		    var url = Common.apiUrl + "/identity/v1/accounts/" + sessionStorage.account_id + "/cloud_accounts/" + cloudCredentialId + "?_method=DELETE";
		    $.ajax({
                url: url,
                type: 'POST',
                dataType: 'json',
                contentType: 'application/x-www-form-urlencoded',
                success: function(data) {
                    sessionStorage.cloud_accounts = JSON.stringify(data.account.cloud_accounts);
                    Common.vent.trigger("cloudCredentialDeleted");
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            });
		}
	
	
	});

	return CloudCredentialList;

});
