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
        'text!templates/vcloud/compute/vCloudDataCentersTemplate.html',
        '/js/vcloud/models/compute/vCloudDataCenter.js',
        '/js/vcloud/collections/compute/vCloudDataCenters.js',
        'text!templates/emptyGraphTemplate.html',
        'icanhaz',
        'common',
        'morris',
        'spinner',
        'jquery.dataTables'
], function( $, _, Backbone, ResourceAppView, VCloudDataCentersAppTemplate, DataCenter, DataCenters, emptyGraph, ich, Common, Morris, Spinner ) {
    'use strict';

    var VCloudDataCentersAppView = ResourceAppView.extend({
        
        template : _.template(VCloudDataCentersAppTemplate),

        emptyGraphTemplate : _.template(emptyGraph),

        columns : ["name", "id"],

        idColumnNumber : 1,

        model : DataCenter,

        collectionType : DataCenters,

        subtype : "dataCenters",

        events: {
            'click #resource_table tr': "clickOne",
            'click #monitoring': 'refreshMonitors',
            'click #refresh_monitors_button': 'refreshMonitors'
        },

        initialize : function ( options ) {
            if(options.cred_id) {
                this.credentialId = options.cred_id;
            }
            if(options.region) {
                this.region = options.region;
            }
            this.render();
            
            var orgsApp = this;
            Common.vent.on("dataCenterAppRefresh", function() {
                orgsApp.render();
            });
        }
    });

    return VCloudDataCentersAppView;
});