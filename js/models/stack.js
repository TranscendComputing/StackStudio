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

    var Stack = ResourceModel.extend({
        idAttribute: "_id",

        defaults: {
            _id: '',
            account_id: '',
            name: '',
            description: '',
            compatible_clouds: [],
            template: '',
            create_at: '',
            updated_at: ''
        },

        parse: function(resp) {
            return resp.stack;
        },

        create: function(options) {
            var url = Common.apiUrl + "/stackstudio/v1/stacks";
            this.sendAjaxAction(url, "POST", options, "stackCreated");
        },

        update: function(options) {
            var url = Common.apiUrl + "/stackstudio/v1/stacks/" + this.id +"?_method=PUT";
            this.sendAjaxAction(url, "POST", options, "stackUpdated");
        },

        destroy:function() {
            var url = Common.apiUrl + "/stackstudio/v1/stacks/" + this.id +"?_method=DELETE";
            this.sendAjaxAction(url, "POST", undefined, "stackDeleted");
        }

    });

    return Stack;
});
