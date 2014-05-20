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
        'text!templates/aws/compute/awsTagsAppTemplate.html',
        'aws/models/compute/awsTag',
        'aws/collections/compute/awsTags',
        'aws/views/compute/awsKeyPairCreateView',
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
        
        modelStringIdentifier: "value",
        
        columns: ["key","value","resource_id", "resource_type"],
        
        idColumnNumber: 0,
        
        model: Keypair,
        
        collectionType: Keypairs,
        
        type: "compute",
        
        subtype: "tags",
        
        CreateView: AwsKeyPairCreate,
        
        events: {
            'click .create_button': 'createNew',
            'click #action_menu ul li': 'performAction',
            'click #resource_table tr': "clickOne"
        },

        actions: [
            { text: "Delete Key Pair", type: "row" }
        ],

        initialize: function(options) {
            if(options.cred_id) {
                this.credentialId = options.cred_id;
            }
            if(options.region) {
                this.region = options.region;
            }
            this.$el.html(this.template);
            this.loadData({ render: true });
            
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
            //Disable any needed actions
        },
        
        performAction: function(event) {
            var keyPair = this.collection.get(this.selectedId);
            switch(event.target.text)
            {
            case "Delete Key Pair":
                //keyPair.destroy(this.credentialId, this.region);
                break;
            }
        }
    });
    
    return AwsKeyPairsAppView;
});
