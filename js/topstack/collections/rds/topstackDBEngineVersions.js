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
        '/js/topstack/models/rds/topstackDBEngineVersion.js',
        'common'
], function( $, Backbone, DBEngineVersion, Common ) {
    'use strict';

    var DBEngineVersionList = Backbone.Collection.extend({

        model: DBEngineVersion,

        url: Common.apiUrl + '/stackstudio/v1/cloud_management/topstack/rds/engine_versions'
        
    });

    return DBEngineVersionList;

});
