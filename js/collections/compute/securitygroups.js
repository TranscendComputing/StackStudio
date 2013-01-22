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
        'models/compute/securitygroup',
        'common'
], function( $, Backbone, SecurityGroup, Common ) {
    'use strict';

    // SecurityGroup Collection
    // ---------------

    var SecurityGroupList = Backbone.Collection.extend({

        // Reference to this collection's model.
        model: SecurityGroup,

        url: 'securityGroupData.json',
    });

    // Create our global collection of **SecurityGroups**.
    return new SecurityGroupList();

});
