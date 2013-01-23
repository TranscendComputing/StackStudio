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
        'text!templates/aws/compute/awsSecurityGroupAppTemplate.html',
        '/js/aws/models/compute/awsSecurityGroup.js',
        '/js/aws/collections/compute/awsSecurityGroups.js',
        '/js/aws/views/compute/awsSecurityGroupRowView.js',
        '/js/aws/views/compute/awsSecurityGroupCreateView.js',
        'icanhaz',
        'common',
        'jquery.dataTables'
], function( $, _, Backbone, ResourceAppView, awsSecurityGroupAppTemplate, Securitygroup, securitygroups, AwsSecurityGroupRowView, AwsSecurityGroupCreate, ich, Common ) {
    'use strict';

    // Aws Security Group Application View
    // ------------------------------

    /**
     * AwsSecurityGroupsAppView is UI view list of aws security groups.
     *
     * @name AwsSecurityGroupsAppView
     * @constructor
     * @category Resources
     * @param {Object} initialization object.
     * @returns {Object} Returns a AwsSecurityGroupsAppView instance.
     */
    var AwsSecurityGroupsAppView = ResourceAppView.extend({
        template: _.template(awsSecurityGroupAppTemplate),
        
        modelStringIdentifier: "name",
        
        idRowNumber: 1,
        
        model: Securitygroup,
        
        collection: securitygroups,
        
        type: "compute",
        
        subtype: "securitygroups",
        
        CreateView: AwsSecurityGroupCreate,
        
        RowView: AwsSecurityGroupRowView,
        
        events: {
            'click #create_button': 'createNew',
            'click #resource_table tbody': 'clickOne'
        },

        initialize: function() {
            this.render();
        }
    });
    
    return AwsSecurityGroupsAppView;
});
