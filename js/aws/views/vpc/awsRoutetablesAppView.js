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
        'text!templates/aws/vpc/awsRouteTableAppTemplate.html',
        '/js/aws/models/vpc/awsRouteTable.js',
        '/js/aws/collections/vpc/awsRouteTables.js',
        '/js/aws/views/vpc/awsRouteTableCreateView.js',
        'icanhaz',
        'common',
        'jquery.dataTables'
], function( $, _, Backbone, FeatureNotImplementedView, ResourceAppView, awsRouteTableAppTemplate, RouteTable, RouteTables, AwsRouteTableCreate, ich, Common ) {
    'use strict';

    // Aws RouteTable Application View
    // ------------------------------

    /**
     * AwsRouteTablesAppView is UI view list of cloud routeTables.
     *
     * @name RouteTableAppView
     * @constructor
     * @category Resources
     * @param {Object} initialization object.
     * @returns {Object} Returns a AwsRouteTablesAppView instance.
     */
    var AwsRouteTablesAppView = ResourceAppView.extend({
        template: _.template(awsRouteTableAppTemplate),
        
        modelStringIdentifier: "route_table_id",
        
        columns: ["vpc_id", "route_table_id"],
        
        idColumnNumber: 1,
        
        model: RouteTable,
        
        collectionType: RouteTables,
        
        type: "vpc",
        
        subtype: "routetables",
        
        CreateView: AwsRouteTableCreate,
        
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
    
    return AwsRouteTablesAppView;
});
