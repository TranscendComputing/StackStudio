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
        'underscore',
        'backbone',
        'common',
        'views/dialogView',
        'text!templates/openstack/identity/openstackUserCreateTemplate.html',
        '/js/openstack/models/identity/openstackUser.js',
        '/js/openstack/collections/identity/openstackTenants.js',
        'jquery.ui.selectmenu'
], function( $, _, Backbone, Common, DialogView, userCreateTemplate, User, Tenants ) {

    var UserCreateView = DialogView.extend({

        template: _.template(userCreateTemplate),
        
        credentialId: undefined,

        region: undefined,

        user: new User(),

        events: {
            "dialogclose": "close"
        },

        initialize: function(options) {
            this.credentialId = options.cred_id;
            this.region = options.region;
        },
        
        render: function() {
            this.$el.html(this.template);
            var createView = this;
            this.$el.dialog({
                autoOpen: true,
                title: "Create User",
                width:500,
                minHeight: 150,
                resizable: false,
                modal: true,
                buttons: {
                    Create: function () {
                        createView.create();
                    },
                    Cancel: function() {
                        createView.cancel();
                    }
                }
            }); 
            $("select").selectmenu();
            this.tenants = new Tenants();
            this.tenants.fetch({ data: $.param({ cred_id: this.credentialId, region: this.region}), reset: true });
            this.tenants.on('reset', this.addAllTenants, this);
        },

        addAllTenants: function() {
            $("#tenant_select").empty();
            this.tenants.each(function(tenant) {
                $("#tenant_select").append("<option value="+tenant.attributes.id+">"+tenant.attributes.name+"</option>");
            });
            $("#tenant_select").selectmenu();
        },

        displayValid: function(valid, selector) {
            if(valid) {
                $(selector).css("border-color", "");
            }else{
                $(selector).css("border-color", "#FF0000");
            }
        },

        create: function() {
            var newUser = this.user;
            var options = {};
            // Validation
            var issue = false;
            if($("#username_input").val() !== "") {
                options.name = $("#username_input").val();
                this.displayValid(true, "#username_input");
            }else {
                issue = true;
                this.displayValid(false, "#username_input");
            }
            if($("#email_input").val() !== "") {
                options.email = $("#email_input").val();
                this.displayValid(true, "#email_input");
            }else {
                issue = true;
                this.displayValid(false, "#email_input");
            }
            if($("#password_input").val() !== "" && $("#password_input").val() === $("#password_confirm_input").val()) {
                options.password = $("#password_input").val();
                this.displayValid(true, "#password_input");
                this.displayValid(true, "#password_confirm_input");
            }else {
                issue = true;
                this.displayValid(false, "#password_input");
                this.displayValid(false, "#password_confirm_input");
            }
            options.tenantId = $("#tenant_select").val();

            if(!issue) {
                newUser.create(options, this.credentialId);
                this.$el.dialog('close');
            }
        }

    });
    
    return UserCreateView;
});
