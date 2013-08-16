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
        'text!templates/aws/vpc/awsInternetGatewayAppTemplate.html',
        '/js/aws/models/vpc/awsInternetGateway.js',
        '/js/aws/collections/vpc/awsInternetGateways.js',
        '/js/aws/views/vpc/awsInternetGatewayCreateView.js',
        '/js/aws/views/vpc/awsInternetGatewayAttachView.js',
        '/js/aws/views/vpc/awsInternetGatewayDetachView.js',
        'icanhaz',
        'common',
        'jquery.dataTables'
], function( $, _, Backbone, AppView, awsInternetGatewayAppTemplate, InternetGateway, InternetGateways, AwsInternetGatewayCreateView, InternetGatewayAttachView, InternetGatewayDetachView, ich, Common ) {
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
	var AwsInternetGatewaysAppView = AppView.extend({
	    template: _.template(awsInternetGatewayAppTemplate),
	    
        modelStringIdentifier: "id",
                
        model: InternetGateway,
        
        idColumnNumber: 0,
        
        columns: ["id", "attachment_set.state", "attachment_set.vpcId"],
        
        collectionType: InternetGateways,
        
        type: "vpc",
        
        subtype: "internetgateways",
        
        CreateView: AwsInternetGatewayCreateView,
                
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

            var internetGatewayApp = this;
            Common.vent.on("internetGatewayAppRefresh", function() {
                setTimeout(function() {
                    internetGatewayApp.render();
                }, 1000);
            });
        },
        
        toggleActions: function(e) {
            //Disable any needed actions
            var internetGateway = this.collection.get(this.selectedId);
            if(internetGateway.attributes.attachment_set.hasOwnProperty("vpcId")) {
                $("#detach_vpc").removeClass("ui-state-disabled");
            }else {
                $("#detach_vpc").addClass("ui-state-disabled");
            }
        },
        
        performAction: function(event) {
            var internetGateway = this.collection.get(this.selectedId);
            
            switch(event.target.text)
            {
            case "Delete":
                internetGateway.destroy(this.credentialId, this.region);
                break;
            case "Attach to VPC":
                var attachView = new InternetGatewayAttachView({cred_id: this.credentialId, region: this.region, internet_gateway: internetGateway});
                attachView.render();
                break;
            case "Detach from VPC":
                var detachView = new InternetGatewayDetachView({cred_id: this.credentialId, region: this.region, internet_gateway: internetGateway});
                detachView.render();
                break;
            }
        }
	});
    
	return AwsInternetGatewaysAppView;
});
