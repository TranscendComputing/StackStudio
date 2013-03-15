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
        'common'
], function( $, Backbone, Common ) {
    'use strict';

    // Cloud Account Model
    // ----------

    /**
     *
     * @name CloudAccount
     * @constructor
     * @category Account
     * @param {Object} initialization object.
     * @returns {Object} Returns a CloudAccount instance.
     */
    var CloudAccount = Backbone.Model.extend({

        /** Default attributes for cloud account */
        defaults: {
            id: "",
            name: "New Account",
            cloud_id: "",
            org_id: "",
            cloud_name: "",
            cloud_provider: "",
            prices: [],
            cloud_services: [],
            cloud_mappings: [],
            topstack_enabled: false,
            topstack_configured: false
		},
        /** Parse the response to get wrapped items */
        parse: function(resp) {
            return resp.cloud_account;
        },

        /**
         * Saves a cloud account's cloud service
         * @param  {[type]} service
         * @return {[type]}
         */
        saveCloudService: function(service) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_accounts/" + this.id + "/services";
            var model = this;
            var cloudService = {"cloud_service": service.attributes};
            $.ajax({
                url: url,
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                data: JSON.stringify(cloudService),
                success: function(data) {
                    model.attributes = model.parse(data);
                    Common.vent.trigger("cloudAccountUpdated");
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            });
        },

        deleteCloudService: function(service_id) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_accounts/" + this.id + "/services/" + service_id + "?_method=DELETE";
            var model = this;
            $.ajax({
                url: url,
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                success: function(data) {
                    model.attributes = model.parse(data);
                    Common.vent.trigger("cloudAccountUpdated");
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            });
        }
    });

    return CloudAccount;
});
