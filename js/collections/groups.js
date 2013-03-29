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
        'models/group',
        'common'
], function( $, Backbone, Group, Common ) {
    'use strict';

    var GroupList = Backbone.Collection.extend({

        model: Group,

        url: Common.apiUrl + '/identity/v1/orgs/' + sessionStorage.org_id + '.json',
        
        parse: function(resp) {
            return resp.org.groups;
        }
    });
    
    return GroupList;

});
