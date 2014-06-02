/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2014 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
define([
        'models/resource/resourceModel',
        'common'
], function( ResourceModel, Common ) {
    'use strict';

    var Appliance = ResourceModel.extend({
        idAttribute: 'Name',

        defaults: {
            _id: '',
            Name: 'New Appliance',
            spec_url: '',
            instance_count: '1'
        },

        parse: function(resp) {
            return resp.Appliance;
        },

        create: function(options) {
            // var url = Common.apiUrl + "/stackstudio/v1/appliances";
            // var successMessage = options.name + " created";
            // this.sendAjaxAction(url, "POST", options, "applianceCreated", successMessage);
        },

        update: function(options) {
            // var url = Common.apiUrl + "/stackstudio/v1/appliances/" + this.id +"?_method=PUT";
            // var successMessage = this.get("name") + " updated";
            // this.sendAjaxAction(url, "POST", options, "applianceUpdated", successMessage);
        },

        destroy:function() {
            // var url = Common.apiUrl + "/stackstudio/v1/appliances/" + this.id +"?_method=DELETE";
            // var successMessage = this.get("name") + " deleted";
            // this.sendAjaxAction(url, "POST", undefined, "applianceDeleted", successMessage);
        }

    });

    return Appliance;
});