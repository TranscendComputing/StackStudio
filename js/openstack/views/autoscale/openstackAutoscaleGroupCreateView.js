/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
define([
        'backbone',
        '/js/topstack/views/autoscale/topstackAutoscaleGroupCreateView.js',
        '/js/openstack/collections/compute/openstackImages.js',
        '/js/openstack/collections/compute/openstackAvailabilityZones.js',
        '/js/openstack/collections/compute/openstackFlavors.js',
        '/js/openstack/collections/compute/openstackKeyPairs.js',
        '/js/openstack/collections/compute/openstackSecurityGroups.js',
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
