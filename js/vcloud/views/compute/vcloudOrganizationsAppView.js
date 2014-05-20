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
        'vcloud/views/compute/vcloudTreeView',
        'text!templates/vcloud/compute/vcloudOrganizationsTemplate.html',
        'vcloud/models/compute/vcloudOrganization',
        'vcloud/collections/compute/vcloudOrganizations',
        'text!templates/emptyGraphTemplate.html',
        'icanhaz',
        'common',
        'morris',
        'spinner',
        'jquery.dataTables'
], function( $, _, Backbone, VCloudTreeView, VCloudOrganizationsAppTemplate, Organization, Organizations, emptyGraph, ich, Common, Morris, Spinner ) {
    'use strict';

    var VCloudOrganizationsAppView = VCloudTreeView.extend({
        
        template : _.template(VCloudOrganizationsAppTemplate),

        // emptyGraphTemplate : _.template(emptyGraph),

        // columns : ["name", "id"],

        // idColumnNumber : 1,

        model : Organization,

        collectionType : Organizations,

        subtype : "organizations",

        events: {
            'click #action_menu ul li': 'performAction',
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
            Common.vent.on("snapshotAppRefresh", function() {
                orgsApp.render();
            });
        }
    });

    return VCloudOrganizationsAppView;
});
