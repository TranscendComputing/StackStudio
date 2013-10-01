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

    var Portfolio = ResourceModel.extend({
        idAttribute: '_id',

        defaults: {
            _id: '',
            name: 'New Portfolio',
            group_id: '',
            description: '',
            version: '',
            offerings: []
        },

        parse: function(resp) {
            return resp.portfolio;
        },

        create: function(options) {
            var url = Common.apiUrl + "/stackstudio/v1/portfolios";
            var successMessage = options.name + " created";
            this.sendAjaxAction(url, "POST", options, "portfolioCreated", successMessage);
        },

        update: function(options) {
            var url = Common.apiUrl + "/stackstudio/v1/portfolios/" + this.id +"?_method=PUT";
            var successMessage = this.get("name") + " updated";
            this.sendAjaxAction(url, "POST", options, "portfolioUpdated", successMessage);
        },

        destroy:function() {
            var url = Common.apiUrl + "/stackstudio/v1/portfolios/" + this.id +"?_method=DELETE";
            var successMessage = this.get("name") + " deleted";
            this.sendAjaxAction(url, "POST", undefined, "portfolioDeleted", successMessage);
        }

    });

    return Portfolio;
});