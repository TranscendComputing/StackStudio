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
        'text!templates/aws/compute/awsKeyPairAppTemplate.html',
        '/js/aws/models/compute/awsKeyPair.js',
        '/js/aws/collections/compute/awsKeyPairs.js',
        '/js/aws/views/compute/awsKeyPairCreateView.js',
        'icanhaz',
        'common',
        'jquery.dataTables'
], function( $, _, Backbone, ResourceAppView, awsKeyPairAppTemplate, Keypair, Keypairs, AwsKeyPairCreate, ich, Common ) {
    'use strict';

    // Aws Security Group Application View
    // ------------------------------

    /**
     * AwsKeyPairsAppView is UI view list of aws key pairs.
     *
     * @name AwsSecurityGroupsAppView
     * @constructor
     * @category Resources
     * @param {Object} initialization object.
     * @returns {Object} Returns a AwsKeyPairsAppView instance.
     */
    var AwsKeyPairsAppView = ResourceAppView.extend({
        template: _.template(awsKeyPairAppTemplate),
        
        modelStringIdentifier: "name",
        
        columns: ["name", "fingerprint"],
        
        idColumnNumber: 0,
        
        model: Keypair,
        
        collectionType: Keypairs,
        
        type: "compute",
        
        subtype: "keypairs",
        
        CreateView: AwsKeyPairCreate,
        
        events: {
            'click .create_button': 'createNew',
            'click #action_menu ul li': 'performAction',
            'click #resource_table tr': "toggleActions"
        },

        initialize: function(options) {
            if(options.cred_id) {
                this.credentialId = options.cred_id;
            }
            this.render();
            
            var keyPairApp = this;
            Common.vent.on("keyPairAppRefresh", function() {
                keyPairApp.render();
            });
            Common.vent.on("keyPairAppDelayRefresh", function() {
                setTimeout(function() {
                    keyPairApp.render();
                }, 2000);
            });
        },
        
        toggleActions: function(e) {
            this.clickOne(e);
            //Disable any needed actions
        },
        
        performAction: function(event) {
            var keyPair = this.collection.get(this.selectedId);
            
            switch(event.target.text)
            {
            case "Delete Key Pair":
                keyPair.destroy(this.credentialId);
                break;
            }
        }
    });
    
    return AwsKeyPairsAppView;
});
