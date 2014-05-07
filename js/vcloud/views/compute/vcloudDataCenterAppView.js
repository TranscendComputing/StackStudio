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
        'text!templates/vcloud/compute/vcloudDataCentersTemplate.html',
        '/js/vcloud/models/compute/vcloudDataCenter.js',
        '/js/vcloud/collections/compute/vcloudDataCenters.js'
], function( $, _, Backbone, ResourceDetailView, VCloudDataCenterTemplate, DataCenter, DataCenters ) {
    'use strict';

    var VCloudDataCentersAppView = ResourceDetailView.extend({
        
        template : _.template(VCloudDataCenterTemplate),

        initialize : function () {
            this.render();
        }
    });

    return VCloudDataCentersAppView;
});