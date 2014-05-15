/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
define([
    'topstack/views/load_balancer/topstackLoadbalancersAppView',
    'openstack/views/load_balancer/openstackLoadBalancerCreateView',
    'openstack/views/load_balancer/openstackManageAvailabilityZonesView',
    'openstack/views/load_balancer/openstackRegisterInstancesView'
], function( TopStackLoadBalancerAppView, OpenStackLoadBalancerCreateView, OpenStackManageAvailabilityZonesView, OpenStackRegisterInstancesView ) {
    'use strict';

    var OpenstackLoadBalancerAppView = TopStackLoadBalancerAppView.extend({
        
        CreateView: OpenStackLoadBalancerCreateView,

        ManageAvailabilityZonesView: OpenStackManageAvailabilityZonesView,

        RegisterInstancesView: OpenStackRegisterInstancesView

    });
    
    return OpenstackLoadBalancerAppView;
});
