/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
define([
        'backbone',
        'topstack/views/autoscale/topstackAutoscaleGroupCreateView',
        'openstack/collections/compute/openstackImages',
        'openstack/collections/compute/openstackAvailabilityZones',
        'openstack/collections/compute/openstackFlavors',
        'openstack/collections/compute/openstackKeyPairs',
        'openstack/collections/compute/openstackSecurityGroups'
], function( Backbone, TopStackAutoScaleCreateView, Images, AvailabilityZones, Flavors, KeyPairs, SecurityGroups) {
    
    var AutoscaleGroupCreateView = TopStackAutoScaleCreateView.extend({
        
        imagesType: Images,
        
        availabilityZonesType: AvailabilityZones,

        flavorsType: Flavors,
        
        keyPairsType: KeyPairs,
        
        securityGroupsType: SecurityGroups,

        initialize: function(options) {
            this.credentialId = options.cred_id;
            this.region = options.region;
        }
    });
    
    return AutoscaleGroupCreateView;
});
