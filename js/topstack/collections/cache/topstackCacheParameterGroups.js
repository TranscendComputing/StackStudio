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
        '/js/topstack/models/cache/topstackCacheParameterGroup.js',
        'common'
], function( $, Backbone, CacheParameterGroup, Common ) {
    'use strict';


    var CacheParameterGroupList = Backbone.Collection.extend({

        model: CacheParameterGroup,

        url: Common.apiUrl + '/stackstudio/v1/cloud_management/topstack/cache/parameter_groups'
        
    });

    return CacheParameterGroupList;

});
