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
], function( $, _, Backbone, ResourceAppView, awsSecurityGroupAppTemplate, securitygroup, securitygroups, AwsSecurityGroupRowView, AwsSecurityGroupCreate, ich, Common ) {
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
        modelStringIdentifier: "name",
        idRowNumber: 1,
        model: securitygroup,
        collection: securitygroups,
        type: "compute",
        subtype: "securitygroups",
        createView: AwsSecurityGroupCreate,
        rowView: AwsSecurityGroupRowView,
        
        events: {
            'click #create_button': 'createNew',
            'click #resource_table tbody': 'clickOne'
        },

        initialize: function() {
            var compiledTemplate = _.template(awsSecurityGroupAppTemplate);
            this.$el.html(compiledTemplate);
            ich.refresh();
            $('#create_button').button();
            this.$table = $('#resource_table').dataTable({"bJQueryUI": true});
            this.collection.on( 'add', this.addOne, this );
            this.collection.on( 'reset', this.addAll, this );
            this.collection.on( 'all', this.render, this );

            // Fetch will pull results from the server
            this.collection.fetch();
        }
    });
    
    return AwsSecurityGroupsAppView;
});
