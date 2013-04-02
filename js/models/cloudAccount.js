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
        'common',
        'messenger'
], function( $, Backbone, Common, Messenger ) {
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
            name: "New Account",
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
        updateService: function(serviceModel) {
            Messenger.options = {
                extraClasses: 'messenger-fixed messenger-on-bottom messenger-on-left',
                theme: 'future'
            };
            var model = this;
            var cloudService = {"cloud_service": serviceModel.toJSON()};
            new Messenger().run({
                errorMessage: "Unable to save " + serviceModel.get("service_type") + " service.",
                successMessage: serviceModel.get("service_type") + " service saved.",
                showCloseButton: true,
                hideAfter: 2,
                hideOnNavigate: true
            },{
                url: this.url() + "/services/" + serviceModel.id + "?_method=PUT",
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                data: JSON.stringify(cloudService),
                success: function(data) {
                    model.attributes = model.parse(data);
                    Common.vent.trigger("cloudAccountUpdated");
                }
            });
        },

        deleteService: function(service) {
            Messenger.options = {
                extraClasses: 'messenger-fixed messenger-on-bottom messenger-on-left',
                theme: 'future'
            };
            var model = this;
            new Messenger().run({
                errorMessage: "Unable to delete " + service.name + " service.",
                successMessage: service.name + " service deleted.",
                showCloseButton: true,
                hideAfter: 2,
                hideOnNavigate: true
            },{
                url: this.url() + "/services/" + service.id + "?_method=DELETE",
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                success: function(data) {
                    model.attributes = model.parse(data);
                    Common.vent.trigger("cloudAccountUpdated");
                }
            });
        }
    });

    return CloudAccount;
});
