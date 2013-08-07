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
        '/js/aws/models/iam/awsUser.js',
        'common'
], function( $, Backbone, User, Common ) {
    'use strict';


    var UserList = Backbone.Collection.extend({

        model: User,

        url: Common.apiUrl + '/stackstudio/v1/cloud_management/aws/iam/users'
        
    });

    return UserList;

});
