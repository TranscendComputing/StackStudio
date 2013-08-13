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
        'common'
], function( $, Backbone, Common ) {
    'use strict';

    var Group = Backbone.Model.extend({

        /** Default attributes for country */
        defaults: {
            id: '',
            name: '',
            description: '',
            org_id: '',
            group_memberships: []
        },
        
        parse: function(resp) {
            return resp.group;
        },

        create: function(options) {
            var url = Common.apiUrl + "/identity/v1/orgs/" + sessionStorage.org_id + "/groups";
            var group = {group: options};
            this.sendPostAction(url, group);
        },

        addUser: function(accountId) {
            $.ajax({
                url: Common.apiUrl + "/identity/v1/orgs/" + sessionStorage.org_id + "/groups/" + this.attributes.id + "/accounts/" + accountId,
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                success: function(data) {
                    Common.vent.trigger("groupUserRefresh");
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            }); 
        },

        removeUser: function(accountId) {
            $.ajax({
                url: Common.apiUrl + "/identity/v1/orgs/" + sessionStorage.org_id + "/groups/" + this.attributes.id + "/accounts/" + accountId + "?_method=DELETE",
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                success: function(data) {
                    Common.vent.trigger("groupUserRefresh");
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            }); 
        },

        hasUser: function(accountId) {
            var hasUser = false;
            $.each(this.attributes.group_memberships, function(index, value) {
                if(accountId === value.group_membership.account.id) {
                    hasUser = true;
                }
            });
            return hasUser;
        },

        destroy: function() {
            $.ajax({
                url: Common.apiUrl + "/identity/v1/orgs/" + this.attributes.org_id + "/groups/" + this.attributes.id + "?_method=DELETE",
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                success: function(data) {
                    Common.vent.trigger("groupRefresh");
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            }); 
        },

        sendPostAction: function(url, options) {
            $.ajax({
                url: url,
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                data: JSON.stringify(options),
                success: function(data) {
                    Common.vent.trigger("groupRefresh");
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            }); 
        }
    });

    return Group;
});
