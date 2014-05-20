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
        'aws/models/iam/awsGroupUser',
        'common'
], function( $, Backbone, GroupUser, Common ) {
    'use strict';


    var GroupUsersList = Backbone.Collection.extend({

        model: GroupUser,

        initialize: function(options) {
            this.url = Common.apiUrl + '/stackstudio/v1/cloud_management/aws/iam/groups/' + options["group_name"] + '/users';
        }
        
    });

    return GroupUsersList;

});
