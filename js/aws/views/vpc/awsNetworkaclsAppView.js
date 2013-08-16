/*!
 * (c) Copyright 2012-2013 Transcend Computing, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an AS IS BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
        'views/featureNotImplementedView',
        'views/resource/resourceAppView',
        'text!templates/aws/vpc/awsNetworkAclAppTemplate.html',
        '/js/aws/models/vpc/awsNetworkAcl.js',
        '/js/aws/collections/vpc/awsNetworkAcls.js',
        '/js/aws/views/vpc/awsNetworkAclCreateView.js',
        'icanhaz',
        'common',
        'jquery.dataTables'
], function( $, _, Backbone, FeatureNotImplementedView, AppView, awsNetworkAclAppTemplate, NetworkAcl, NetworkAcls, AwsNetworkAclCreateView, ich, Common ) {
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
        },

        render: function() {
            var featureNotImplemented = new FeatureNotImplementedView({feature_url: "https://github.com/TranscendComputing/StackStudio/issues/8", element: "#resource_app"});
            featureNotImplemented.render();
        },

        toggleActions: function(e) {
            //Disable any needed actions
        }
	});
    
	return AwsNetworkAclsAppView;
});
