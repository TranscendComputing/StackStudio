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
        'text!templates/openstack/identity/openstackUserCreateTemplate.html',
        '/js/openstack/models/identity/openstackUser.js',
        '/js/openstack/collections/identity/openstackUsers.js',
        '/js/openstack/collections/identity/openstackTenants.js',
        'jquery.ui.selectmenu',
        'jquery.multiselect',
        'jquery.multiselect.filter'
], function( $, _, Backbone, Common, ich, DialogView, userCreateTemplate, User, Users, Tenants ) {

    var VolumeCreateView = DialogView.extend({
        
        credentialId: undefined,

        region: undefined,
        
        collection: new Users(),

        template: userCreateTemplate,

        events: {
            "dialogclose": "close",
            "selectmenuchange select#tenant_select": "setSelectedTenant"
        },

        initialize: function(options) {
            this.credentialId = options.cred_id;
            this.region = options.region;
            this.model = new User({}, {collection: this.collection});
            this.tenants = new Tenants();
            this.tenants.on("reset", function(){
                this.renderView();
            }, this);
            this.tenants.fetch({ data: $.param({ cred_id: this.credentialId, region: this.region}) });
        },
        
        renderView: function() {
            var createView = this;
            ich.addTemplate("user_create_template", this.template);
            this.$el.html( ich.user_create_template({tenants: this.tenants.toJSON()}) );
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

            // This line adds required asterisk to all fields with class 'required'
            this.$(".required").after("<span class='required'/>");
        },

        /**
         *    Change event for selectmenu
         *    @author Curtis   Stewart
         *    @param  {[type]} event   [description]
         *    @param  {[type]} object  {index: <zero-based index of the selected option>, option: <option element itself>, value: <value of the option, string>}
         */
        setSelectedTenant: function(event, object) {
            if(object.index !== 0)
            {
                var tenantId = $(object.option).data().id;
                this.model.set({tenant_id: tenantId});
            }else{
                this.model.unset("tenant_id");
            }
        },

        create: function() {
            this.model.set({
                name: $("#username_input").val(),
                email: $("#email_input").val(),
                password: $("#password_input").val(),
                passwordConfirmation: $("#password_confirm_input").val()
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
