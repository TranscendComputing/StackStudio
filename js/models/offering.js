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

    var Offering = ResourceModel.extend({
        idAttribute: '_id',

        defaults: {
            _id: '',
            name: 'New Offering',
            account_id: '',
            version: '',
            url: '',
            sku: '',
            icon: '',
            illustration: '',
            brief_description: '',
            detailed_description: '',
            eula: '',
            eula_custom: '',
            support: '',
            pricing: '',
            category: '',
            stacks: []
        },

        parse: function(resp) {
            return resp.offering;
        },

        create: function(options) {
            var url = Common.apiUrl + "/stackstudio/v1/offerings";
            var successMessage = this.get("name") + " created";
            this.sendAjaxAction(url, "POST", options, "offeringCreated", successMessage);
        },

        update: function(options) {
            var url = Common.apiUrl + "/stackstudio/v1/offerings/" + this.id +"?_method=PUT";
            var successMessage = this.get("name") + " updated";
            this.sendAjaxAction(url, "POST", options, "offeringUpdated", successMessage);
        },

        destroy:function() {
            var url = Common.apiUrl + "/stackstudio/v1/offerings/" + this.id +"?_method=DELETE";
            var successMessage = this.get("name") + " deleted";
            this.sendAjaxAction(url, "POST", undefined, successMessage);
        }

    });

    return Offering;
});