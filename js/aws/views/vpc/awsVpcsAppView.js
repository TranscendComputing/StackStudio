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
        'views/resource/resourceAppView',
        'text!templates/aws/vpc/awsVpcAppTemplate.html',
        '/js/aws/models/vpc/awsVpc.js',
        '/js/aws/collections/vpc/awsVpcs.js',
        '/js/aws/views/vpc/awsVpcCreateView.js',
        '/js/aws/views/vpc/awsAssociateDhcpOptionsView.js',
        'icanhaz',
        'common',
        'jquery.dataTables'
], function( $, _, Backbone, AppView, awsVpcAppTemplate, Vpc, Vpcs, AwsVpcCreateView, AssociateDhcpView, ich, Common ) {
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
	var AwsVpcsAppView = AppView.extend({
	    template: _.template(awsVpcAppTemplate),
	    
        modelStringIdentifier: "id",
                
        model: Vpc,
        
        idColumnNumber: 0,
        
        columns:["id","state","cidr_block","dhcp_options_id"],
        
        collectionType: Vpcs,
        
        type: "vpc",
        
        subtype: "vpcs",
        
        CreateView: AwsVpcCreateView,        
                
        events: {
            'click .create_button': 'createNew',
            'click #action_menu ul li': 'performAction',
            'click #resource_table tr': "clickOne"
        },

        initialize: function(options) {
            if(options.cred_id) {
                this.credentialId = options.cred_id;
            }
            if(options.region) {
                this.region = options.region;
            }
            this.render();

            var vpcApp = this;
            Common.vent.on("vpcAppRefresh", function() {
                vpcApp.render();
            });
        },
        
        toggleActions: function(e) {
            //Disable any needed actions
        },

        performAction: function(event) {
            var vpc = this.collection.get(this.selectedId);
            
            switch(event.target.text)
            {
            case "Delete":
                vpc.destroy(this.credentialId, this.region);
                break;
            case "Change DHCP Options Set":
                new AssociateDhcpView({vpc: vpc, cred_id: this.credentialId, region: this.region});
                break;
            }
        }
	});
    
	return AwsVpcsAppView;
});
