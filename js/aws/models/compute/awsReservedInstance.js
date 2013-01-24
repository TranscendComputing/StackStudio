/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
define([
        'jquery',
        'backbone'
], function( $, Backbone ) {
    'use strict';

    /**
     *
     * @name ReservedInstance
     * @constructor
     * @category Compute
     * @param {Object} initialization object.
     * @returns {Object} Returns a ReservedInstance.
     */
    var ReservedInstance = Backbone.Model.extend({

        /** Default attributes for reserved instance */
        defaults: {
            reservedInstancesId: '',
            instanceType: '',
            availabilityZone: '',
            duration: '',
            fixedPrice: '',
            usagePrice: '',
            instanceCount: '',
            productDescription: '',
            state: ''
        }
    });

    return ReservedInstance;
});
