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
        'text!templates/google/compute/googleNetworkCreateTemplate.html',
        'google/models/compute/googleNetwork',
        'icanhaz',
        'common'
        
], function( $, _, Backbone, DialogView, networkCreateTemplate, Network, ich, Common ) {
    
    /**
     * googleNetworkCreateView is UI form to create compute.
     *
     * @name NetworkCreateView
     * @constructor
     * @category Compute
     * @param {Object} initialization object.
     * @returns {Object} Returns a googleNetworkCreateView network.
     */
    
    var GoogleNetworkCreateView = DialogView.extend({

        credentialId: undefined,

        region: undefined,
        
        network: new Network(),
        
        // Delegated events for creating new networks, etc.
        events: {
            "dialogclose": "close"
        },

        initialize: function(options) {
            this.credentialId = options.cred_id;
            this.region = options.region;
            var createView = this;
            var compiledTemplate = _.template(networkCreateTemplate);
            this.$el.html(compiledTemplate);

            this.$el.dialog({
                autoOpen: true,
                title: "Create Compute Network",
                resizable: false,
                width: 425,
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

        render: function() {
            
        },
        
        create: function() {
            var newNetwork = this.network;
            var ntwrk = {};
            
            var issue = false;
            
            if($("#name_input").val() !== "" ) {
                ntwrk.network_name = $("#name_input").val();
            }else {
                issue = true;
            }
            
            if($("#iprange_input").val() !== "" ) {
                ntwrk.ip_range = $("#iprange_input").val();
            }else {
                issue = true;
            }
            
            if(!issue) {
                newNetwork.create(ntwrk, this.credentialId);
                this.$el.dialog('close');
            } else {
                Common.errorDialog("Invalid Request", "Please supply all required fields.");
            }
        }
    });
    
    return GoogleNetworkCreateView;
});
