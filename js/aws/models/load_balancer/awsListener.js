/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
define([
        'models/resource/resourceModel',
        'common'
], function( ResourceModel, Common ) {
    'use strict';

    var Listener = ResourceModel.extend({

        idAttribute: 'lb_port',

        defaults: {
            policy_names: [],
            instance_port: 0,
            instance_protocol: '',
            lb_port: 0,
            protocol: '',
            ssl_id: '',
            removeFromLoadBalancerButton: '<a href="" class="remove_listener">Remove from Load Balancer</a>'
        }

    });

    return Listener;
});
