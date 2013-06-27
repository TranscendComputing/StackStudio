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
        'text!templates/openstack/identity/openstackTenantCreateTemplate.html',
        '/js/openstack/models/identity/openstackTenant.js',
], function( $, _, Backbone, Common, DialogView, tenantCreateTemplate, Tenant ) {

    var TenantCreateView = DialogView.extend({

        template: _.template(tenantCreateTemplate),
        
        credentialId: undefined,

        region: undefined,

        tenant: new Tenant(),

        events: {
            "dialogclose": "close",
        },

        initialize: function(options) {
            this.credentialId = options.cred_id;
            this.region = options.region;
        },
        
        render: function() {
            var createView = this;
            this.$el.html(this.template);

            this.$el.dialog({
                autoOpen: true,
                title: "Create Tenant",
                width: 350,
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
        },

        displayValid: function(valid, selector) {
            if(valid) {
                $(selector).css("border-color", "");
            }else{
                $(selector).css("border-color", "#FF0000");
            }
        },

        create: function() {
            var newTenant = this.tenant;
            var options = {};
            var issue = false;
            if($("#tenant_name_input").val() !== "") {
                this.displayValid(true, "#tenant_name_input");
                options.name = $("#tenant_name_input").val();
            }else {
                this.displayValid(false, "#tenant_name_input");
                issue = true;
            }
            if($("#description_input").val() !== "") {
                options.description = $("#description_input").val();
            }
            if(! $("#enabled_checkbox").is(":checked")) {
                options.enabled = false;
            }

            if(!issue) {
                newTenant.create(options, this.credentialId, this.region);
                this.$el.dialog('close');
            }
        }

    });
    
    return TenantCreateView;
});
