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
        'aws/models/simple_db/awsSimpleDatabase',
        'common'
], function( $, Backbone, SimpleDB, Common ) {
    'use strict';

    var SimpleDBList = Backbone.Collection.extend({

        model: SimpleDB,

        url: Common.apiUrl + '/stackstudio/v1/cloud_management/aws/simple_db/databases'
    });

    return SimpleDBList;

});
