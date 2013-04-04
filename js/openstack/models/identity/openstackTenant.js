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
], function( $, Backbone, Common, Messenger) {
    'use strict';

    // Base Tenant Model
    // ----------

    /**
     *
     * @name Tenant
     * @constructor
     * @category Identity
     * @param {Object} initialization object.
     * @returns {Object} Returns a Tenant instance.
     */
    var Tenant = Backbone.Model.extend({

        validate: function(attrs, options) {
            if(attrs.name === "" || attrs.name === undefined)
            {
                return this.validationError;
            }
        },
		
		create: function(credentialId, region) {
            var url = "?cred_id=" + credentialId + "&region=" + region;
            this.sendPostAction(url, {tenant: this.attributes});
        },
        
        destroy: function(credentialId, region) {
            var url = "?_method=DELETE&cred_id=" + credentialId + "&region=" + region;
            this.sendPostAction(url);
        },

        removeUser: function(userModel, roleModel, trigger, credentialId, region) {
            var url = "/users/" + userModel.id + "?_method=DELETE&cred_id=" + credentialId + "&region=" + region,
                data,
                messageOptions;

            if(roleModel)
            {
                data = {role_id: roleModel.id};
                messageOptions = {
                    successMessage: roleModel.get("name") + " role removed from " + userModel.get("name") + " user on " + this.get("name"),
                    progressMessage: "Removing " + roleModel.get("name") + " role from " + userModel.get("name") + " user on " + this.get("name"),
                    errorMessage: "Error removing " + roleModel.get("name") + " role from " + userModel.get("name") + " user on " + this.get("name"),
                    showCloseButton: true
                };
            }else{
                data = {};
                messageOptions = {
                    successMessage: userModel.get("name") + " has been removed from " + this.get("name"),
                    progressMessage: "Removing " + userModel.get("name") + " from " + this.get("name"),
                    errorMessage: "Error removing " + userModel.get("name") + " from " + this.get("name"),
                    showCloseButton: true
                };
            }
            Messenger.options = {
                extraClasses: 'messenger-fixed messenger-on-bottom messenger-on-left'
            };
            new Messenger().run(messageOptions,{
                url: this.url() + url,
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                data: JSON.stringify(data),
                success: function(data) {
                    Common.vent.trigger(trigger);
                }
            }, this);
        },

        addUser: function(userModel, roleModel, trigger, credentialId, region) {
            var url = "/users/" + userModel.id + "?cred_id=" + credentialId + "&region=" + region;
            Messenger.options = {
                extraClasses: 'messenger-fixed messenger-on-bottom messenger-on-left'
            };
            new Messenger().run({
                successMessage: roleModel.get("name") + " role added for " + userModel.get("name") + " on " + this.get("name"),
                progressMessage: "Adding " + roleModel.get("name") + " role to " + userModel.get("name") + " on " + this.get("name"),
                errorMessage: "Error adding " + roleModel.get("name") + " role to " + userModel.get("name") + " on " + this.get("name"),
                showCloseButton: true
            },{
                url: this.url() + url,
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                data: JSON.stringify({role_id: roleModel.id}),
                success: function(data) {
                    Common.vent.trigger(trigger);
                }
            }, this);
        },
		
		sendPostAction: function(url, options, trigger) {
            //Set default values for options and trigger if nothing is passed
            options = typeof options !== 'undefined' ? options : {};
            trigger = typeof trigger !== 'undefined' ? trigger : "tenantAppRefresh";

            $.ajax({
                url: this.url() + url,
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                data: JSON.stringify(options),
                success: function(data) {
                    Common.vent.trigger(trigger);
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            }); 
        }
    
    });

    return Tenant;
});
