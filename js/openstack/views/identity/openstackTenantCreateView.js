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
        'icanhaz',
        'views/dialogView',
        'text!templates/openstack/identity/openstackTenantCreateTemplate.html',
        '/js/openstack/models/identity/openstackTenant.js',
        '/js/openstack/collections/identity/openstackTenants.js',
        'jquery.ui.selectmenu',
        'jquery.multiselect',
        'jquery.multiselect.filter'
], function( $, _, Backbone, Common, ich, DialogView, tenantCreateTemplate, Tenant, Tenants ) {

    var VolumeCreateView = DialogView.extend({
        
        credentialId: undefined,

        region: undefined,
        
        collection: new Tenants(),

        template: tenantCreateTemplate,

        events: {
            "dialogclose": "close",
            "change input#enabled_input": "toggleEnabled"
        },

        initialize: function(options) {
            this.credentialId = options.cred_id;
            this.region = options.region;
            this.model = new Tenant({}, {collection: this.collection});
            this.render();
        },
        
        render: function() {
            var createView = this;
            ich.addTemplate("tenant_create_template", this.template);
            this.$el.html( ich.tenant_create_template(this.model.toJSON()) );
            this.$el.dialog({
                autoOpen: true,
                title: "Create Tenant",
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

            // This line adds required asterisk to all fields with class 'required'
            this.$(".required").after("<span class='required'/>");
        },

        toggleEnabled: function(event) {
            // Set enabled attribute to value of checkbox target
            this.model.set({enabled: $(event.currentTarget).is(":checked")});
        },

        create: function() {
            this.model.set({
                name: $("#name_input").val(),
                description: $("#description_textarea").val()
            });
            if(!this.model.isValid())
            {
                Common.errorDialog("Validation Error", this.model.validationError);
            }else{
                this.model.create(this.credentialId, this.region); 
                this.$el.dialog('close');
            }
        }

    });
    
    return VolumeCreateView;
});
