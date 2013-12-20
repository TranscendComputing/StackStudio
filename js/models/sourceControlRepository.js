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

    var SourceControlRepository = ResourceModel.extend({
        idAttribute: '_id',

        defaults: {
            _id: '',
            org_id: '',
            name: 'New Repository',
            type: '',
            url: '',
            username: '',
            password: '',
            key: '',
            config_managers: []
        },

        parse: function(resp) {
            return resp.source_control_repository;
        },

        create: function(options) {
            var url = Common.apiUrl + "/api/v1/source_control_repositories";
            var successMessage = options.name + " created";
            this.sendAjaxAction(url, "POST", options, "SCRepoCreated", successMessage);
        },

        update: function(options) {
            var url = Common.apiUrl + "/api/v1/source_control_repositories/" + this.id +"?_method=PUT";
            var successMessage = this.get("name") + " updated";
            this.sendAjaxAction(url, "POST", options, "SCRepoUpdated", successMessage);
        },

        destroy:function() {
            var url = Common.apiUrl + "/api/v1/source_control_repositories/" + this.id +"?_method=DELETE";
            var successMessage = this.get("name") + " deleted";
            this.sendAjaxAction(url, "POST", undefined, "SCRepoDeleted", successMessage);
        }

    });

    return SourceControlRepository;
});