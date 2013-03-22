/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true*/
/*global define:true console:true alert:true*/
define([
        'jquery',
        'backbone',
        'models/cloudCredential',
        'common',
        'messenger'
], function( $, Backbone, CloudCredential, Common, Messenger ) {
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
            Messenger.options = {
                extraClasses: 'messenger-fixed messenger-on-bottom messenger-on-right',
                theme: 'future'
            };
            var coll = this;
            var url = Common.apiUrl + "/identity/v1/accounts/" + sessionStorage.account_id + "/" + options.cloud_account_id + "/cloud_credentials";
            var cloudCredential = {"cloud_credential": model.attributes};
            new Messenger().run({
                errorMessage: "Unable to save credentials.",
                successMessage: "Credentials saved.",
                showCloseButton: true,
                hideAfter: 2,
                hideOnNavigate: true
            },{
                url: url,
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                data: JSON.stringify(cloudCredential),
                success: function(data) {
                    var cloudCreds = [];
                    sessionStorage.cloud_credentials = JSON.stringify(data.account.cloud_credentials);
                    var cloudCredentials = JSON.parse(sessionStorage.cloud_credentials);
                    $.each(cloudCredentials, function(index, value) {
                        var cloudCred = new CloudCredential(value.cloud_credential);
                        cloudCreds.push(cloudCred);
                    });
                    coll.reset(cloudCreds);
                }
            }, coll);
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
            new Messenger().run({
                errorMessage: "Unable to save credentials.",
                successMessage: "Credentials saved.",
                showCloseButton: true,
                hideAfter: 2,
                hideOnNavigate: true
            },{
                url: url,
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                data: JSON.stringify(cloudCredential),
                success: function(data) {
                    sessionStorage.cloud_credentials = JSON.stringify(data.account.cloud_credentials);
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
            new Messenger().run({
                errorMessage: "Unable to delete credentials.",
                successMessage: "Credentials deleted.",
                showCloseButton: true,
                hideAfter: 2,
                hideOnNavigate: true
            },{
                url: url,
                type: 'POST',
                dataType: 'json',
                contentType: 'application/x-www-form-urlencoded',
                success: function(data) {
                    sessionStorage.cloud_credentials = JSON.stringify(data.account.cloud_credentials);
                    coll.remove(cloudCredential);
                    Common.vent.trigger("cloudCredentialDeleted");
                }
            });
		}


	});

	return CloudCredentialList;

});
