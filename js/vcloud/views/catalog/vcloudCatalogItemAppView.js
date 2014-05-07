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
        'views/resource/resourceDetailView',
        'text!templates/vcloud/catalog/vcloudCatalogItemTemplate.html',
        'text!templates/emptyGraphTemplate.html',
        'icanhaz',
        'common',
        'morris',
        'spinner',
        'jquery.dataTables'
], function( $, _, Backbone, ResourceDetailView, VCloudCatalogItemTemplate, emptyGraph, ich, Common, Morris, Spinner ) {
    'use strict';

    var VCloudCatalogAppView = ResourceDetailView.extend({

        template : _.template(VCloudCatalogItemTemplate),
        
        initialize : function ( options ) {
            options = options || {};
            this.cred_id = options.cred_id;
            this.render();
        },

        events : {
            'click #create_vapp_button' : 'instantiate'
        },

        instantiate : function () {

            var appView = this;

            $.ajax({
                type : 'POST',
                url : Common.apiUrl + '/stackstudio/v1/cloud_management/vcloud/catalogs/instance',
                data : {
                    id : appView.model.catalog,
                    template : appView.model.name,
                    name : 'testing_instantiate_vapp',
                    cred_id : appView.cred_id
                },
                success : function ( result ) {
                    console.log('result: ', result);
                }
            });
        }
    });

    return VCloudCatalogAppView;
});