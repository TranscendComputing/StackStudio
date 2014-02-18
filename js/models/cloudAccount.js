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
        
        create: function(options, org_id, login, cloud_id) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_accounts?org_id=" + org_id + "&cloud_id=" + cloud_id + "&login=" + login;
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
        
        destroy: function(login) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_accounts/" + this.id + "?_method=DELETE" + "&login=" + login;
            
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
        
        addService: function(options,login) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_accounts/" + this.id + "/services?_method=POST" + "&login=" + login;
            
            var cloud_service = {"cloud_service":options};
            
            $.ajax({
                url: url,
                type: "POST",
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                data: JSON.stringify(cloud_service),
                success: function(data) {
                    Common.vent.trigger("servicesRefresh",data);
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
        updateService: function(serviceModel,login) {
            Messenger.options = {
                extraClasses: 'messenger-fixed messenger-on-bottom messenger-on-left',
                theme: 'future'
            };
            var model = this;
            var cloudService = {"cloud_service": serviceModel.toJSON()};
            new Messenger().run({
                errorMessage: "Unauthorized: Only admin can update services.",
                successMessage: serviceModel.get("service_type") + " service saved.",
                showCloseButton: true,
                hideAfter: 4,
                hideOnNavigate: true
            },{
                url: this.url() + "/services/" + serviceModel.id + "?_method=PUT" + "&login=" + login,
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                data: JSON.stringify(cloudService),
                success: function(data) {
                    Common.vent.trigger("cloudAccountUpdated",data);
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

        deleteService: function(service,login) {
            Messenger.options = {
                extraClasses: 'messenger-fixed messenger-on-bottom messenger-on-left',
                theme: 'future'
            };
            var model = this;
            new Messenger().run({
                errorMessage: "Unauthorized: Only admin can delete services.",
                successMessage: service.name + " service deleted.",
                showCloseButton: true,
                hideAfter: 4,
                hideOnNavigate: true
            },{
                url: this.url() + "/services/" + service.id + "?_method=DELETE" + "&login=" + login,
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                success: function(data) {
                    model.attributes = model.parse(data);
                    Common.vent.trigger("cloudAccountUpdated");
                }
            });
        },

        updateConfigManagers: function(managerIds){
            var url = Common.apiUrl + "/stackstudio/v1/cloud_accounts/"+this.attributes.id+"/managers?_method=PUT";
            var options = {"config_manager_ids":managerIds};

            $.ajax({
                url: url,
                type: "POST",
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                data: JSON.stringify(options),
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            });
        }
    });

    return CloudAccount;
});
