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
        'text!templates/openstack/network/openstackFloatingIpCreateTemplate.html',
        '/js/openstack/models/network/openstackFloatingIp.js',
        '/js/openstack/collections/network/openstackFloatingIps.js',
        'jquery.ui.selectmenu',
        'jquery.multiselect',
        'jquery.multiselect.filter'
], function( $, _, Backbone, Common, ich, DialogView, floatingIpCreateTemplate, FloatingIp, FloatingIps ) {

    var VolumeCreateView = DialogView.extend({
        
        credentialId: undefined,

        region: undefined,
        
        collection: new FloatingIps(),

        template: floatingIpCreateTemplate,

        events: {
            "dialogclose": "close"
        },

        initialize: function(options) {
            this.credentialId = options.cred_id;
            this.region = options.region;
            this.model = new FloatingIp({}, {collection: this.collection});
            this.render();
        },
        
        render: function() {
            var createView = this;
            ich.addTemplate("floating_ip_create_template", this.template);
            this.$el.html( ich.floating_ip_create_template(this.model.toJSON()) );
            this.$el.dialog({
                autoOpen: true,
                title: "Create FloatingIp",
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

        create: function() {
            this.model.set({
                name: $("#name_input").val()
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
