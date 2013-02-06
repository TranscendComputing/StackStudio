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

    // Aws Instance Model
    // ----------

    /**
     *
     * @name Instance
     * @constructor
     * @category Compute
     * @param {Object} initialization object.
     * @returns {Object} Returns an Instance.
     */
    var Instance = Backbone.Model.extend({

        /** Default attributes for instance */
        defaults: {
            id: '',
            image_id: '',
            flavor_id: '',
            block_device_mapping: {},
            network_interfaces: [],
            iam_instance_profile: {},
            state: '',
            monitoring: false,
            availability_zone: '',
            placement_group: {},
            tenancy: '',
            product_codes: [],
            state_reason: {},
            tags: {},
            ownerId: '',
            private_dns_name: '',
            dns_name: '',
            reason: {},
            key_name: '',
            ami_launch_index: 0,
            created_at: '',
            kernel_id: '',
            private_ip_address: '',
            public_ip_address: '',
            root_device_type: '',
            client_token: '',
            ebs_optimized: false,
            groups: [],
            security_group_ids: []
        }

    });

    return Instance;
});
