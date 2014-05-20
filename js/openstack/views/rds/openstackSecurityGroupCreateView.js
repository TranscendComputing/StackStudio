/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
define([
        'backbone',
        'topstack/views/rds/topstackSecurityGroupCreateView'
], function( Backbone, TopStackSecurityGroupCreateView ) {
    
    var OpenStackSecurityGroupCreateView = TopStackSecurityGroupCreateView.extend({
        
        initialize: function(options) {
            this.credentialId = options.cred_id;
            this.region = options.region;
        }
    });
    
    return OpenStackSecurityGroupCreateView;
});
