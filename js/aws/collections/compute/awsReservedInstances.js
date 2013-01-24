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
        '/js/aws/models/compute/awsReservedInstance.js',
        'common'
], function( $, Backbone, ReservedInstance, Common ) {
    'use strict';

    // ReservedInstance Collection
    // ---------------

    var ReservedInstanceList = Backbone.Collection.extend({

        // Reference to this collection's model.
        model: ReservedInstance,

        url: 'samples/reservedInstanceSample.json'
    });
    
    return new ReservedInstanceList();

});
