/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
define([
        'jquery',
        'underscore',
        'backbone',
        'views/resourceAppView',
        'text!templates/aws/vpc/awsNetworkAclAppTemplate.html',
        '/js/aws/models/vpc/awsNetworkAcl.js',
        '/js/aws/collections/vpc/awsNetworkAcls.js',
        '/js/aws/views/vpc/awsNetworkAclCreateView.js',
        'icanhaz',
        'common',
        'jquery.dataTables'
], function( $, _, Backbone, AppView, awsNetworkAclAppTemplate, NetworkAcl, NetworkAcls, AwsNetworkAclCreateView, ich, Common ) {
	'use strict';

	// Aws Application View
	// ------------------------------

    /**
     * Aws AppView is UI view list of cloud items.
     *
     * @name AppView
     * @constructor
     * @category Resources
     * @param {Object} initialization object.
     * @returns {Object} Returns an AwsAppView instance.
     */
	var AwsNetworkAclsAppView = AppView.extend({
	    template: _.template(awsNetworkAclAppTemplate),
	    
        modelStringIdentifier: "network_acl_id",
                
        model: NetworkAcl,
        
        idColumnNumber: 0,
        
        columns: ["network_acl_id","vpc_id", "default"],
        
        collectionType: NetworkAcls,
        
        type: "vpc",
        
        subtype: "networkAcls",
        
        CreateView: AwsNetworkAclCreateView,
                
        events: {
            'click .create_button': 'createNew',
            'click #resource_table tr': 'clickOne'
        },

        initialize: function() {
            this.render();
            this.$el.html("<div><center><h3>Coming Soon!</h3></center></div>");
        },

        toggleActions: function(e) {
            //Disable any needed actions
        }
	});
    
	return AwsNetworkAclsAppView;
});