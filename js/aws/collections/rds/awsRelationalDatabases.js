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
        '/js/aws/models/rds/awsRelationalDatabase.js',
        'common'
], function( $, Backbone, RelationalDatabase, Common ) {
    'use strict';


    var RelationalDatabaseList = Backbone.Collection.extend({

        model: RelationalDatabase,

        url: Common.apiUrl + '/stackstudio/v1/cloud_management/aws/rds/databases'
        
    });

    return RelationalDatabaseList;

});
