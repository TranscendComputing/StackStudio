/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true alert:true*/
define([
        'jquery',
        'underscore',
        'backbone',
        'views/dialogView',
        'text!templates/google/compute/googleFirewallCreateTemplate.html',
        '/js/google/models/compute/googleFirewall.js',
        'icanhaz',
        'common',
        'jquery.multiselect'
], function( $, _, Backbone, DialogView, firewallCreateTemplate, Firewall, ich, Common ) {
    
    /**
     * googleNetworkCreateView is UI form to create compute.
     *
     * @name NetworkCreateView
     * @constructor
     * @category Compute
     * @param {Object} initialization object.
     * @returns {Object} Returns a googleNetworkCreateView network.
     */
    
    var GoogleFirewallCreateView = DialogView.extend({

        credentialId: undefined,

        region: undefined,
        
        network: new Firewall(),
        
        // Delegated events for creating new networks, etc.
        events: {
            "dialogclose": "close"
        },

        initialize: function(options) {
            this.credentialId = options.cred_id;
            this.region = options.region;
            var createView = this;
            var compiledTemplate = _.template(firewallCreateTemplate);
            this.$el.html(compiledTemplate);

            this.$el.dialog({
                autoOpen: true,
                title: "Create Compute Firewall",
                resizable: false,
                width: 450,
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
            
            $("#allowed_select").multiselect({
                selectedList: 3,
                noneSelectedText: "Select Allowed Protocol(s)"
            });
            //$("#network_select").selectmenu();
            
            this.addAllNetworks();
        },

        render: function() {
            
        },
        
        create: function() {
            var newFirewall = this.network;
            var frwll = {};
            
            var issue = false;
            
            if($("#name_input").val() !== "" ) {
                frwll.firewall_name = $("#name_input").val();
            }else {
                issue = true;
            }
            
            if($("#iprange_input").val() !== "" ) {
                frwll.source_range = [$("#iprange_input").val()];
            }else {
                issue = true;
            }
            
            frwll.network = $("#network_select").val();
            
            frwll.allowed = [];
            $("#allowed_select > option").each(function() {
                //alert(this.text + ' ' + this.value);
                var allowedIPProtocol = {'IPProtocol':this.value};
                frwll.allowed.push(allowedIPProtocol);
            });
            
            if(!issue) {
                newFirewall.create(frwll, this.credentialId);
                console.log(frwll);
                this.$el.dialog('close');
            } else {
                Common.errorDialog("Invalid Request", "Please supply all required fields.");
            }
        },
        
        addAllNetworks: function() {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/google/compute/networks?_method=GET&cred_id=" + this.credentialId;
            
            $.ajax({
                url: url,
                type: "GET",
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                success: function(payload) {
                    var networks = payload;
                    $("#network_select").empty();
                    if(networks){
                        $.each(networks, function(i, network) {
                            $("#network_select").append("<option value='"+network.name+"'>" + network.name + "</option>");
                        });
                    }
                    //$("#network_select").selectmenu();
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            });
        },
    });
    
    return GoogleFirewallCreateView;
});
