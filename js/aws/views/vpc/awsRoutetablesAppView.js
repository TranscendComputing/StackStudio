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
        'text!templates/aws/vpc/awsRouteTableAppTemplate.html',
        '/js/aws/models/vpc/awsRouteTable.js',
        '/js/aws/collections/vpc/awsRouteTables.js',
        '/js/aws/views/vpc/awsRouteTableCreateView.js',
        'icanhaz',
        'common',
        'jquery.dataTables'
], function( $, _, Backbone, AppView, awsRouteTableAppTemplate, RouteTable, RouteTables, awsRouteTableCreateView, ich, Common ) {
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
    var AwsRouteTablesAppView = AppView.extend({
        template: _.template(awsRouteTableAppTemplate),
        
        modelStringIdentifier: "id",

        model: RouteTable,

        idColumnNumber: 0,
        
        columns: ["id", "vpc_id"],
        
        collectionType: RouteTables,
        
        type: "vpc",
        
        subtype: "routetables",
        
        CreateView: awsRouteTableCreateView,
        
        events: {
            'click .create_button': 'createNew',
            'click #action_menu ul li': 'performAction',
            'click #resource_table tr': 'clickOne'
        },

        initialize: function(options) {
            if(options.cred_id) {
                this.credentialId = options.cred_id;
            }
            if(options.region) {
                this.region = options.region;
            }
            this.render();
            
            var routeTableApp = this;
            Common.vent.on("routeTableAppRefresh", function() {
                routeTableApp.render();
            });
        },
        
        toggleActions: function(e) {
            //Disable any needed actions
        },

        performAction: function(event) {
            var routeTable = this.collection.get(this.selectedId);
            
            switch(event.target.text)
            {
            case "Delete":
                routeTable.destroy(this.credentialId, this.region);
                break;
            }
        }
    });
    
    return AwsRouteTablesAppView;
});
