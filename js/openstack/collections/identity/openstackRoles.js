/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
define([
        'jquery',
        'underscore',
        'backbone',
        '/js/openstack/models/identity/openstackRole.js',
        'common'
], function( $, _, Backbone, Role, Common ) {
    'use strict';

    // Role Collection
    // ---------------

    var RoleList = Backbone.Collection.extend({

        // Reference to this collection's model.
        model: Role,

        // CloudMux url for Openstack Role APIs
        url: Common.apiUrl + '/stackstudio/v1/cloud_management/openstack/identity/roles',

        without: function(collection) {
            var result = new Backbone.Collection();
            _.each(this.models, function(model) {
                if(!collection.get(model.id))
                {
                    result.add(model);
                }
            });
            return result;
        }
    });

    // Create our global collection of **Volumes**.
    return RoleList;

});
