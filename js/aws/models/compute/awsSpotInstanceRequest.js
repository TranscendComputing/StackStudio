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
     * @name SpotInstance
     * @constructor
     * @category Compute
     * @param {Object} initialization object.
     * @returns {Object} Returns a SpotInstance.
     */
    var SpotInstance = Backbone.Model.extend({

        /** Default attributes for spot instance */
        defaults: {
            id: '',
            price: 0.0,
            request_type: '',
            created_at: '',
            instance_count: 0,
            instance_id: '',
            state: '',
            valid_from: '',
            valid_until: '',
            launch_group: '',
            availability_zone_group: '',
            product_description: '',
            groups: [],
            key_name: '',
            availability_zone: '',
            flavor_id: '',
            image_id: '',
            monitoring: false,
            block_device_mapping: [],
            subnet_id: '',
            tags: {},
            fault: '',
            user_data: ''
        }
    });

    return SpotInstance;
});
