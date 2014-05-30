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
        'openstack/models/compute/openstackInstance',
        'common'
], function( $, Backbone, Instance, Common ) {
    'use strict';

    // Instance Collection
    // ---------------
    
    var InstanceList = Backbone.Collection.extend({

        // Reference to this collection's model.
        model: Instance,
        //url: 'samples/grizzly_instances.json'
        url: Common.apiUrl + '/stackstudio/v1/cloud_management/openstack/compute/instances'
    });
    // Create our global collection of **Instances**.
    return InstanceList;

});
