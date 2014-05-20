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
        'aws/models/cache/awsCacheSecurityGroup',
        'common'
], function( $, Backbone, CacheSecurityGroup, Common ) {
    'use strict';


    var CacheSecurityGroupList = Backbone.Collection.extend({

        model: CacheSecurityGroup,

        url: Common.apiUrl + '/stackstudio/v1/cloud_management/aws/cache/security_groups'
        
    });

    return CacheSecurityGroupList;

});
