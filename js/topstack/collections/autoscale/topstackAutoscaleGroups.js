/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
define([
        'jquery',
        'backbone',
        'topstack/models/autoscale/topstackAutoscaleGroup',
        'common'
], function( $, Backbone, AutoscaleGroup, Common ) {
    'use strict';

    var AutoscaleGroupList = Backbone.Collection.extend({

        model: AutoscaleGroup,

        url: Common.apiUrl + '/stackstudio/v1/cloud_management/topstack/autoscale/autoscale_groups'
    });

    return AutoscaleGroupList;

});
