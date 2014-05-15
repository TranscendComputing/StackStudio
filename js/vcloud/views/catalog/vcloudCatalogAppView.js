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
        'text!templates/vcloud/catalog/vcloudCatalogTemplate.html',
        'vcloud/models/catalog/vcloudCatalog',
        'vcloud/collections/catalog/vcloudCatalogs',
        'text!templates/emptyGraphTemplate.html',
        'icanhaz',
        'common',
        'morris',
        'spinner',
        'jquery.dataTables'
], function( $, _, Backbone, ResourceDetailView, VCloudCatalogTemplate, Catalog, Catalogs, emptyGraph, ich, Common, Morris, Spinner ) {
    'use strict';

    var VCloudCatalogAppView = ResourceDetailView.extend({

        template : _.template(VCloudCatalogTemplate),
        
        initialize : function () {
            this.render();
        }
    });

    return VCloudCatalogAppView;
});
