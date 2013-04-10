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
        '/js/aws/models/rds/awsDBParameterGroup.js',
        'common'
], function( $, Backbone, DBParameterGroup, Common ) {
    'use strict';


    var DBParameterGroupList = Backbone.Collection.extend({

        model: DBParameterGroup,

        url: Common.apiUrl + '/stackstudio/v1/cloud_management/aws/rds/parameter_groups/describe'
        
    });

    return DBParameterGroupList;

});
