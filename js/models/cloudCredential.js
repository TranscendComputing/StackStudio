/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
define([
        'jquery',
        'backbone'
], function( $, Backbone ) {
    'use strict';

    // Cloud Credential Model
    // ----------

    /**
     *
     * @name CloudCredential
     * @constructor
     * @category Account
     * @param {Object} initialization object.
     * @returns {Object} Returns a CloudCredential instance.
     */
    var CloudCredential = Backbone.Model.extend({

        /** Default attributes for cloud credential */
        defaults: {
            id: "",
            name: "New Account",
            description: "",
            cloud_id: "",
            cloud_name: "",
            cloud_provider: "",
            access_key: "",
            secret_key: "",
            cloud_attributes: {},
            audit_logs: [],
            topstack_enabled: false,
            topstack_configured: false
		}

    });

    return CloudCredential;
});
