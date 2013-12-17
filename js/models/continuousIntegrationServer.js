/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
define([
        'models/resource/resourceModel',
        'common'
], function( ResourceModel, Common ) {
    'use strict';

    var ContinuousIntegrationServer = ResourceModel.extend({
        idAttribute: '_id',

        defaults: {
            _id: '',
            org_id: '',
            name: 'New CI Server',
            type: '',
            host: '',
            protocol: '',
            port: '',
            username: '',
            password: '',
            config_managers: []
        },

        parse: function(resp) {
            return resp.continuous_integration_server;
        },

        create: function(options) {
            var url = Common.apiUrl + "/stackstudio/v1/continuous_integration_servers";
            var successMessage = options.name + " created";
            this.sendAjaxAction(url, "POST", options, "CIServerCreated", successMessage);
        },

        update: function(options) {
            var url = Common.apiUrl + "/stackstudio/v1/continuous_integration_servers/" + this.id +"?_method=PUT";
            var successMessage = this.get("name") + " updated";
            this.sendAjaxAction(url, "POST", options, "CIServerUpdated", successMessage);
        },

        destroy:function() {
            var url = Common.apiUrl + "/stackstudio/v1/continuous_integration_servers/" + this.id +"?_method=DELETE";
            var successMessage = this.get("name") + " deleted";
            this.sendAjaxAction(url, "POST", undefined, "CIServerDeleted", successMessage);
        }

    });

    return ContinuousIntegrationServer;
});