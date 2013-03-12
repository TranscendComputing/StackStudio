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
        'views/dialogView',
        'text!templates/aws/vpc/awsDhcpOptionsSetCreateTemplate.html',
        '/js/aws/models/vpc/awsDhcpOptionsSet.js',
        'icanhaz',
        'common',
        'jquery.ui.selectmenu',
        'jquery.multiselect',
        'jquery.multiselect.filter'
        
], function( $, _, Backbone, DialogView, dhcpOptionSetCreateTemplate, DhcpOptionsSet, ich, Common ) {
    
    var DhcpOptionsSetCreateView = DialogView.extend({

        credentialId: undefined,
        
        template: _.template(dhcpOptionSetCreateTemplate),

        dhcpOption: new DhcpOptionsSet(),

        events: {
            "dialogclose": "close"
        },

        initialize: function(options) {
            this.credentialId = options.cred_id;
        },

        render: function() {
            var createView = this;
            this.$el.html(this.template);

            this.$el.dialog({
                autoOpen: true,
                title: "Create DHCP Options Set",
                width:700,
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
        
        create: function() {
            var dhcpOption = this.dhcpOption;
            var options = {};
            options.dhcp_configuration_set = {};
            if($("#domain_name_input").val() != "") {
                options.dhcp_configuration_set["domain-name"] = $("#domain_name_input").val();
            }
            if($("#domain_name_servers_input").val() != "") {
                options.dhcp_configuration_set["domain-name-servers"] = $("#domain_name_servers_input").val();
            }
            if($("#ntp_servers_input").val() != "") {
                options.dhcp_configuration_set["ntp-servers"] = $("#ntp_servers_input").val();
            }
            if($("#netbios_name_servers_input").val() != "") {
                options.dhcp_configuration_set["netbios-name-servers"] = $("#netbios_name_servers_input").val();
            }
            if($("#netbios_node_type_input").val() != "") {
                options.dhcp_configuration_set["netbios-node-type"] = $("#netbios_node_type_input").val();
            }

            dhcpOption.create(options, this.credentialId);
            this.$el.dialog('close');
        }

    });
    
    return DhcpOptionsSetCreateView;
});
