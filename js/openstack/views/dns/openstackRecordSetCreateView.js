/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
define([
        'backbone',
        'topstack/views/dns/topstackRecordSetCreateView'
], function( Backbone, TopStackRecordSetCreateView ) {
    
    var OpenStackRecordSetCreateView = TopStackRecordSetCreateView.extend({
        
        initialize: function(options) {
            this.credentialId = options.cred_id;
            this.hostedZone = options.hosted_zone;
            this.previousRecordSet = options.record_set;
        }
    });
    
    return OpenStackRecordSetCreateView;
});
