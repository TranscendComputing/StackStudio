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

    var User = Backbone.Model.extend({

        /** Default attributes for country */
        defaults: {
            id: '',
            company: '',
            country_id: '',
            created_at: '',
            email: '',
            first_name: '',
            last_name: '',
            login: '',
            num_logins: 0,
            org_id: '',
            updated_at: ''
        },
        
        parse: function(resp) {
            return resp.account;
        },

        get: function(attr) {
            if(typeof this[attr] === 'function') {
                var attribute = this[attr]();
                return attribute;
            }
            
            return Backbone.Model.prototype.get.call(this, attr);
        },

        role: function() {
            var role = "User";
            if(this.hasPermission("admin", "transcend")) {
                role = "Admin";
            }
            return role;
        },

        hasPermission: function(permissionName, permissionEnvironment) {
            var found = false;
            if(this.attributes.permissions) {
                $.each(this.attributes.permissions, function(index, value) {
                    if(value.permission.name === permissionName && value.permission.environment === permissionEnvironment) {
                        found = true;
                    }
                });
            }
            return found;
        },

        addPermission: function(permissionName, permissionEnvironment) {
            var permission = {permission:{name:permissionName, environment:permissionEnvironment}};
            $.ajax({
                url: Common.apiUrl + "/identity/v1/accounts/" + this.attributes.id + "/permissions",
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                data: JSON.stringify(permission),
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            });
        },

        removePermission: function(permissionID) {
            $.ajax({
                url: Common.apiUrl + "/identity/v1/accounts/" + this.attributes.id + "/permissions/" + permissionID + "?_method=DELETE",
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            });
        },

        updateAttributes: function(options, addAdmin){
            var userUpdate = this;
            var url = Common.apiUrl + "/identity/v1/accounts/" + this.attributes.id + "/update?_method=PUT";
            $.ajax({
                url: url,
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                data: JSON.stringify(options),
                success: function(data) {
                    // debugger
                    var adminInfo = userUpdate.attributes.permissions;
                    if(addAdmin && adminInfo.length > 0){
                        if(!(adminInfo[0].permission.name === "admin" && adminInfo[0].permission.environment === "transcend")){
                            userUpdate.addPermission("admin","transcend");
                        }
                    }else if(addAdmin && adminInfo.length === 0){
                        userUpdate.addPermission("admin","transcend");
                    }else if(!addAdmin && adminInfo.length > 0) {
                        userUpdate.removePermission(adminInfo[0].permission.id);
                    }
                    Common.vent.trigger("userRefresh");
                    new Messenger().post({type:"success", message:"User Updated..."});
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            });
        },

        destroy: function() {
            $.ajax({
                url: Common.apiUrl + "/identity/v1/accounts/" + this.attributes.id + "?_method=DELETE",
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                success: function(data) {
                    Common.vent.trigger("userRefresh");
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            }); 
        }
    });

    return User;
});
