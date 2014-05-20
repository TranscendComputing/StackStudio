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
        'views/resource/resourceRowView',
        'text!templates/vcloud/compute/vcloudDataCenterAppTemplate.html',
        'vcloud/models/compute/vcloudDataCenter',
        'vcloud/collections/compute/vcloudDataCenters',
        'text!templates/emptyGraphTemplate.html',
        'icanhaz',
        'common',
        'morris',
        'spinner'
], function( $, _, Backbone, ResourceAppView, ResourceRowView, vcloudDataCenterAppTemplate, DataCenter, DataCenters, emptyGraph, ich, Common, Morris, Spinner ) {
    'use strict';

    var DataCenterAppView = ResourceAppView.extend({

        template: _.template(vcloudDataCenterAppTemplate),

        modelStringIdentifier: "id",

        columns: ["id", "name", "is_loaded"],
        
        idColumnNumber: 0,
        
        model: DataCenter,
        
        collectionType: DataCenters,

        type: "compute",
        
        subtype: "dataCenters",
        
        events: {
            // 'click .create_button': 'createNew',
            // 'click #action_menu ul li': 'performAction',
            // 'click #resource_table tr': "clickOne",
            // 'click #monitoring': 'refreshMonitors',
            // 'click #refresh_monitors_button': 'refreshMonitors'
        },

        initialize: function ( options ) {
            if(options.cred_id) {
                this.credentialId = options.cred_id;
            }
            if(options.region) {
                this.region = options.region;
            }

            this.render();
            
            var App = this;
            Common.vent.on("DataCenterAppRefresh", function() {
                App.render();
            });
        }
    });
    
    return DataCenterAppView;
});
