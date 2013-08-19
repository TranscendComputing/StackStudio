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
        'views/resource/resourceAppView',
        'text!templates/google/compute/googleNetworkAppTemplate.html',
        '/js/google/models/compute/googleNetwork.js',
        '/js/google/collections/compute/googleNetworks.js',
        '/js/google/views/compute/googleNetworkCreateView.js',
        'text!templates/emptyGraphTemplate.html',
        'icanhaz',
        'common',
        'morris',
        'spinner',
        'jquery.dataTables'
], function( $, _, Backbone, ResourceAppView, googleNetworkAppTemplate, Network, Networks, GoogleNetworkCreate, emptyGraph, ich, Common, Morris, Spinner ) {
    'use strict';

    // Aws Network Application View
    // ------------------------------

    /**
     * GoogleNetworksAppView is UI view list of cloud networks.
     *
     * @name NetworkAppView
     * @constructor
     * @category Resources
     * @param {Object} initialization object.
     * @returns {Object} Returns a GoogleNetworksAppView network.
     */
    var GoogleNetworksAppView = ResourceAppView.extend({
        
        template: _.template(googleNetworkAppTemplate),

        emptyGraphTemplate: _.template(emptyGraph),
        
        modelStringIdentifier: "id",
        
        columns: ["name", "id", "IPv4Range", "gatewayIPv4"],
        
        idColumnNumber: 1,
        
        model: Network,
        
        collectionType: Networks,
        
        type: "network",
        
        subtype: "networks",
        
        CreateView: GoogleNetworkCreate,
        
        events: {
            'click .create_button': 'createNew',
            'click #action_menu ul li': 'performAction',
            'click #resource_table tr': "clickOne",
            'click #monitoring': 'refreshMonitors',
            'click #refresh_monitors_button': 'refreshMonitors'
        },

        initialize: function(options) {
            if(options.cred_id) {
                this.credentialId = options.cred_id;
            }
            if(options.region) {
                this.region = options.region;
            }
            this.render();
            
            var networkApp = this;
            Common.vent.on("networkAppRefresh", function() {
                networkApp.render();
            });
            
        },
        
        toggleActions: function(e) {
            //Disable any needed actions
        },
        
        performAction: function(event) {
            var network = this.collection.get(this.selectedId);
            switch(event.target.text)
            {
            case "Delete":
                network.delete(this.credentialId, this.region);
                break;
            }
        }
    });

    return GoogleNetworksAppView;
});
