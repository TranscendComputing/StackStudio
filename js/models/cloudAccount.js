/*!
 * (c) Copyright 2012-2013 Transcend Computing, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an AS IS BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
        
        create: function(options, org_id, cloud_id) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_accounts?org_id=" + org_id + "&cloud_id=" + cloud_id;
            var cloud_account = {"cloud_account":options};
            
            $.ajax({
                url: url,
                type: "POST",
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                data: JSON.stringify(cloud_account),
                success: function(data) {
                    Common.vent.trigger("managementRefresh");
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            });
            
        },
        
        destroy: function() {
            
            var url = Common.apiUrl + "/stackstudio/v1/cloud_accounts/" + this.id + "?_method=DELETE";
            
            $.ajax({
                url: url,
                type: "POST",
                contentType: 'application/x-www-form-urlencoded',
                success: function(data) {
                    Common.vent.trigger("managementRefresh");
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            });
            
        },
        
        addService: function(options) {
            
            var url = Common.apiUrl + "/stackstudio/v1/cloud_accounts/" + this.id + "/services?_method=POST";
            
            var cloud_service = {"cloud_service":options};
            
            $.ajax({
                url: url,
                type: "POST",
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                data: JSON.stringify(cloud_service),
                success: function(data) {
                    Common.vent.trigger("servicesRefresh");
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            });
            
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
        
		/**
         * Updates a users cloud Account
         * @param  {CloudAccount} model
         * @param  {Object} options
         * @return {nil}
         */
		update: function() {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_accounts/"+this.attributes.id+"?_method=PUT";
            var cloud_account = {"cloud_account":this.attributes};
            
            $.ajax({
                url: url,
                type: "POST",
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                data: JSON.stringify(cloud_account),
                success: function(data) {
                    Common.vent.trigger("cloudAccountUpdated");
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
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
