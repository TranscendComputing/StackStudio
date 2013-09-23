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
        'text!templates/openstack/identity/openstackTenantConfirmRemoveTemplate.html',
        'jquery.multiselect',
        'jquery.multiselect.filter'
], function( $, _, Backbone, Common, ich, DialogView, tenantConfirmRemoveTemplate ) {

    var TenantConfirmRemoveView = DialogView.extend({
        template: tenantConfirmRemoveTemplate,

        events: {
            "dialogclose": "close",
            "change input#enabled_input": "toggleEnabled"
        },

        initialize: function(options) {
            this.message = options.message;
            this.render();
        },
        
        render: function() {
            var createView = this;
            ich.addTemplate("tenant_confirm_remove_template", this.template);
            this.$el.html( ich.tenant_confirm_remove_template({message: this.message}) );
            this.$el.dialog({
                autoOpen: true,
                title: "Confirm Remove Users",
                width:500,
                minHeight: 150,
                resizable: false,
                modal: true,
                buttons: {
                    Confirm: function () {
                        createView.confirm();
                    },
                    Cancel: function() {
                        createView.cancel();
                    }
                }
            }); 
        },

        confirm: function() {
            Common.vent.trigger("tenant:confirmRemove");
            this.cancel();
        }

    });
    
    return TenantConfirmRemoveView;
});
