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
        'text!templates/vcloud/network/vcloudNetworkAppTemplate.html',
        '/js/vcloud/models/network/vcloudNetwork.js',
        '/js/vcloud/collections/network/vcloudNetworks.js',
        'text!templates/emptyGraphTemplate.html',
        'icanhaz',
        'common',
        'morris',
        'spinner',
        'jquery.dataTables',
        'jquery.dataTables.fnProcessingIndicator'
], function( $, _, Backbone, ResourceAppView, VCloudNetworkTemplate, Network, Networks, emptyGraph, ich, Common, Morris, Spinner ) {
    'use strict';

    var VCloudNetworksAppView = ResourceAppView.extend({
        
        template : _.template(VCloudNetworkTemplate),

        modelStringIdentifier: "name",

        columns : ["name", "status"],

        actions: [
            { text: "Update Network", type: }
        ],

        idColumnNumber : 0,

        model : Network,

        collectionType : Networks,

        type : 'compute',

        subtype : 'networks',

        CreateView : undefined,

        UpdateView : undefined,

        initialize : function ( options ) {


            var appView = this;
            this.vdc = options.data_center;

            options = options || {};
            this.credentialId = options.cred_id;

            this.fetchParams = {
                vdc : this.vdc
            };

            appView.render();

            Common.vent.on("vcloudAppRefresh", appView.render.bind(appView));
        }
    });

    return VCloudNetworksAppView;
});