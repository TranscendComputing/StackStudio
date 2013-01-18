/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
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

		url: 'sampleCloudData.json'

	});

	// Create our global collection of **Computes**.
	return new CloudCredentialList();

});
