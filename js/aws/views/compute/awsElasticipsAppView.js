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
        'text!templates/aws/compute/awsElasticIPAppTemplate.html',
        '/js/aws/models/compute/awsElasticIP.js',
        '/js/aws/collections/compute/awsElasticIPs.js',
        '/js/aws/views/compute/awsElasticIPsRowView.js',
        '/js/aws/views/compute/awsElasticIPsCreateView.js',
        'icanhaz',
        'common',
        'jquery.dataTables'
], function( $, _, Backbone, ResourceAppView, awsElasticIPAppTemplate, Elasticip, elasticips, AwsElasticIPsRowView, AwsElasticIPsCreate, ich, Common ) {
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
        
        modelStringIdentifier: "publicIp",
        
        idRowNumber: 1,
        
        model: Elasticip,
        
        collection: elasticips,
        
        type: "compute",
        
        subtype: "elasticips",
        
        CreateView: AwsElasticIPsCreate,
        
        RowView: AwsElasticIPsRowView,
        
        events: {
            'click #create_button': 'createNew',
            'click #resource_table tbody': 'clickOne'
        },

        initialize: function() {
            this.render();
        }
    });
    
    return AwsElasticIPsAppView;
});
