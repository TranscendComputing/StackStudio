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
        'text!templates/aws/compute/awsElasticIPAppTemplate.html',
        'aws/models/compute/awsElasticIP',
        'aws/collections/compute/awsElasticIPs',
        'aws/views/compute/awsElasticIPsCreateView',
        'aws/views/compute/awsElasticIPAssociateView',
        'icanhaz',
        'common',
        'jquery.dataTables'
], function( $, _, Backbone, ResourceAppView, awsElasticIPAppTemplate, Elasticip, Elasticips, AwsElasticIPsCreate, AwsElasticIpAssociate, ich, Common ) {
    'use strict';

    // Aws Security Group Application View
    // ------------------------------

    /**
     * AwsElasticIPsAppView is UI view list of aws key pairs.
     *
     * @name AwsElasticIPsAppView
     * @constructor
     * @category Resources
     * @param {Object} initialization object.
     * @returns {Object} Returns a AwsElasticIPsAppView instance.
     */
    var AwsElasticIPsAppView = ResourceAppView.extend({
        template: _.template(awsElasticIPAppTemplate),
        
        modelStringIdentifier: "public_ip",
        
        columns: ["public_ip", "server_id", "domain"],
        
        idColumnNumber: 0,
        
        model: Elasticip,
        
        collectionType: Elasticips,
        
        type: "compute",
        
        subtype: "elasticips",
        
        CreateView: AwsElasticIPsCreate,
        
        events: {
            'click .create_button': 'createNew',
            'click #action_menu ul li': 'performAction',
            'click #resource_table tr': "clickOne"
        },

        createText: "Allocate New Address",

        actions: [
            { text: "Release Address", type: "row"},
            { text: "Associate Address", type: "row"},
            { text: "Disassociate Adress", type: "row"}
        ],

        initialize: function(options) {
            if(options.cred_id) {
                this.credentialId = options.cred_id;
            }
            if(options.region) {
                this.region = options.region;
            }

            this.$el.html(this.template);
            this.loadData({render: true});
            
            var elasticIpApp = this;
            Common.vent.on("elasticIPAppRefresh", function() {
                elasticIpApp.render();
            });
        },
        
        toggleActions: function(e) {
            //Disable any needed actions
        },
        
        performAction: function(event) {
            var elasticIp = this.collection.get(this.selectedId);
            
            switch(event.target.text)
            {
            case "Release Address":
                elasticIp.destroy(this.credentialId, this.region);
                break;
            case "Associate Address":
                new AwsElasticIpAssociate({cred_id: this.credentialId, region: this.region, elastic_ip: elasticIp});
                break;
            case "Disassociate Address":
                elasticIp.disassociateAddress(this.credentialId, this.region);
                break;
            }
        }
    });
    
    return AwsElasticIPsAppView;
});
