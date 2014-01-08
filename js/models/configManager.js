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

    var ConfigManager = ResourceModel.extend({
        idAttribute: '_id',

        defaults: {
            _id: '',
            org_id: '',
            name: 'New Config Manager',
            type: '',
            url: '',
            enabled: true,
            auth_properties: {},
            cloud_account_ids: [],
            continuous_integration_servers: [],
            source_control_repositories: [],
            branch: '',
            source_control_paths: []
        },

        parse: function(resp) {
            return resp.config_manager;
        },

        create: function(options) {
            var url = Common.apiUrl + "/api/v1/orchestration/managers";
            var successMessage = options.name + " created";
            this.sendAjaxAction(url, "POST", options, "ConfigManagerCreated", successMessage);
        },

        update: function(options) {
            var url = Common.apiUrl + "/api/v1/orchestration/managers/" + this.id +"?_method=PUT";
            var successMessage = this.get("name") + " updated";
            this.sendAjaxAction(url, "POST", options, "ConfigManagerUpdated", successMessage);
        },

        destroy:function() {
            var url = Common.apiUrl + "/api/v1/orchestration/managers/" + this.id +"?_method=DELETE";
            var successMessage = this.get("name") + " deleted";
            this.sendAjaxAction(url, "POST", undefined, "ConfigManagerDeleted", successMessage);
        }

    });

    return ConfigManager;
});