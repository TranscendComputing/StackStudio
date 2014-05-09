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
        'text!templates/vcloud/compute/vcloudVappAppTemplate.html',
        '/js/vcloud/models/compute/vcloudVapp.js',
        '/js/vcloud/collections/compute/vcloudVapps.js',
        'text!templates/emptyGraphTemplate.html',
        'icanhaz',
        'common',
        'morris',
        'spinner',
        'jquery.dataTables',
        'jquery.dataTables.fnProcessingIndicator'
], function( $, _, Backbone, ResourceAppView, VCloudVappTemplate, Vapp, Vapps, emptyGraph, ich, Common, Morris, Spinner ) {
    'use strict';

    var VCloudVappsAppView = ResourceAppView.extend({
        
        template : _.template(VCloudVappTemplate),

        modelStringIdentifier: "name",

        columns : ["name", "description", "deployed", "status"],

        idColumnNumber : 0,

        model : Vapp,

        collectionType : Vapps,

        type : 'compute',

        subtype : 'vapps',

        CreateView : undefined,

        UpdateView : undefined,

        events : {
            'click #resource_table tr': "clickOne"
        },

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
        },

        toggleActions : function () {
            //not really any actions right now
        }
    });

    return VCloudVappsAppView;
});