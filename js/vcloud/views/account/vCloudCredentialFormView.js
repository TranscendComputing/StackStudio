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
        'icanhaz',
        'common',
        'text!templates/vcloud/account/vCloudCredentialForm.html',
        'models/cloudCredential',
        'collections/cloudCredentials'
], function ( $, _ , Backbone, ich, Common, Template, CloudCredential, CloudCredentials ) {
	'use strict';

	var VCloudCredentialFormView = Backbone.View.extend({

		cloudCredentials : undefined,

		initialize : function ( options ) {

			//render template
			this.$el.html(this.template);

			this.cloudCredentials = new CloudCredentials();
			if(options ) {
				this.$el = options.el || this.$el;

				this.credential = options.credential;
			}
			this.render();
		},

		render : function () {

			//fill template and render the result
			if(!ich['vcloud_credential_form']) {
				ich.grabTemplates();
			}

			var credentialForm = ich.vcloud_credential_form(this.credential);
			this.$el.html(credentialForm);
		}
	});

	return VCloudCredentialFormView;
});
