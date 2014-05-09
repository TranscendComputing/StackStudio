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
        'text!templates/vcloud/catalog/vcloudCatalogAppTemplate.html',
        '/js/vcloud/models/catalog/vcloudCatalog.js',
        '/js/vcloud/collections/catalog/vcloudCatalogs.js',
        'text!templates/emptyGraphTemplate.html',
        'icanhaz',
        'common',
        'morris',
        'spinner',
        'jquery.dataTables',
        'jquery.dataTables.fnProcessingIndicator'
], function( $, _, Backbone, ResourceAppView, VCloudCatalogTemplate, Catalog, Catalogs, emptyGraph, ich, Common, Morris, Spinner ) {
    'use strict';

    var VCloudCatalogsAppView = ResourceAppView.extend({
        
        template : _.template(VCloudCatalogTemplate),

        modelStringIdentifier: "name",

        columns : ["name", "status"],

        idColumnNumber : 0,

        model : Catalog,

        collectionType : Catalogs,

        type : 'compute',

        subtype : 'catalogs',

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

    return VCloudCatalogsAppView;
});