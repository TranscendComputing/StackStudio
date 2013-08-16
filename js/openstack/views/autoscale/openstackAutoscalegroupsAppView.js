/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
define([
    '/js/topstack/views/autoscale/topstackAutoscaleGroupsAppView.js',
    '/js/openstack/views/autoscale/openstackAutoscaleGroupCreateView.js'
], function( TopStackAutoScaleGroupsAppView, OpenStackAutoScaleGroupCreateView ) {
    'use strict';

    var OpenstackAutoscaleAppView = TopStackAutoScaleGroupsAppView.extend({
        
        CreateView: OpenStackAutoScaleGroupCreateView

    });
    
    return OpenstackAutoscaleAppView;
});
