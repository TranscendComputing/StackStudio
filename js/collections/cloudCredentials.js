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

        /**
         * Override Collection.fetch() because CloudCredentials are
         * stored in session storage for a user when logged in (views/accountLoginView)
         * @param  {Object} options
         * @return {nil}
         */
		fetch: function(options) {
		    var cloudCreds = [];
		    if(sessionStorage.cloud_credentials) {
		        var cloudCredentials = JSON.parse(sessionStorage.cloud_credentials);
		        $.each(cloudCredentials, function(index, value) {
		            var cloudCred = new CloudCredential(value.cloud_credential);
		            cloudCreds.push(cloudCred);
		        });
		    }
		    
		    this.reset(cloudCreds);
		},
		/**
         * Creates a new set of cloud credentials for the user
         * @param  {CloudCredential} model
         * @param  {Object} options
         * @return {nil}
         */
		create: function(model, options) {
		    var url = Common.apiUrl + "/identity/v1/accounts/" + sessionStorage.account_id + "/" + options.cloud_account_id + "/cloud_credentials";
		    var cloudCredential = {"cloud_credential": model.attributes};
		    $.ajax({
                url: url,
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                data: JSON.stringify(cloudCredential),
                success: function(data) {
                    sessionStorage.cloud_credentials = JSON.stringify(data.account.cloud_credentials);
                    Common.vent.trigger("cloudCredentialCreated");
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            });
		},
		/**
         * Updates a users cloud credential
         * @param  {CloudCredential} model
         * @param  {Object} options
         * @return {nil}
         */
		update: function(model, options) {
		    var url = Common.apiUrl + "/identity/v1/accounts/" + sessionStorage.account_id + "/cloud_credentials/" + model.attributes.id + "?_method=PUT";
		    var cloudCredential = {"cloud_credential": model.attributes};
		    $.ajax({
                url: url,
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                data: JSON.stringify(cloudCredential),
                success: function(data) {
                    sessionStorage.cloud_credentials = JSON.stringify(data.account.cloud_credentials);
                    Common.vent.trigger("cloudCredentialUpdated");
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            });
		},
		/**
         * Deletes a users cloud credential
         * @param  {Model} cloudCredential
         * @return {nil}
         */
		deleteCredential: function(cloudCredential) {
            var coll = this;
		    var url = Common.apiUrl + "/identity/v1/accounts/" + sessionStorage.account_id + "/cloud_credentials/" + cloudCredential.id + "?_method=DELETE";
		    $.ajax({
                url: url,
                type: 'POST',
                dataType: 'json',
                contentType: 'application/x-www-form-urlencoded',
                success: function(data) {
                    sessionStorage.cloud_credentials = JSON.stringify(data.account.cloud_credentials);
                    coll.remove(cloudCredential);
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            }, coll);
		}
	
	
	});

	return CloudCredentialList;

});
