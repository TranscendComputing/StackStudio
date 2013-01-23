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
        '/js/aws/views/compute/awsKeyPairRowView.js',
        '/js/aws/views/compute/awsKeyPairCreateView.js',
        'icanhaz',
        'common',
        'jquery.dataTables'
], function( $, _, Backbone, ResourceAppView, awsKeyPairAppTemplate, Keypair, keypairs, AwsKeyPairRowView, AwsKeyPairCreate, ich, Common ) {
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
        
        idRowNumber: 1,
        
        model: Keypair,
        
        collection: keypairs,
        
        type: "compute",
        
        subtype: "keypairs",
        
        CreateView: AwsKeyPairCreate,
        
        RowView: AwsKeyPairRowView,
        
        events: {
            'click #create_button': 'createNew',
            'click #resource_table tbody': 'clickOne'
        },

        initialize: function() {
            this.render();
        }
    });
    
    return AwsKeyPairsAppView;
});
