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
        'text!templates/aws/vpc/awsRouteTableAppTemplate.html',
        '/js/aws/models/vpc/awsRouteTable.js',
        '/js/aws/collections/vpc/awsRouteTables.js',
        '/js/aws/views/vpc/awsRouteTableCreateView.js',
        'icanhaz',
        'common',
        'jquery.dataTables'
], function( $, _, Backbone, ResourceAppView, awsRouteTableAppTemplate, RouteTable, routeTables, AwsRouteTableCreate, ich, Common ) {
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
        
        modelStringIdentifier: "routeTableId",
        
        columns: ["vpcId", "routeTableId"],
        
        idColumnNumber: 1,
        
        model: RouteTable,
        
        collection: routeTables,
        
        type: "vpc",
        
        subtype: "routeTables",
        
        CreateView: AwsRouteTableCreate,
        
        events: {
            'click .create_button': 'createNew',
            'click #resource_table tr': 'toggleActions'
        },

        initialize: function() {
            this.render();
            $(".action_menu").on( "menuselect", this.setAction );
        },
        
        setAction: function(e, ui) {
            console.log(e, ui);
            console.log("PERFORMING ACTION");
            return false
        },
        
        toggleActions: function(e) {
            this.clickOne(e);
            $(".display_table").dataTable({
               "bPaginate": false,
               "bSortable": false,
               "bFilter": false,
               "bInfo": false,
               "bLengthChange": false,
               "bJQueryUI": true
            });
        }
    });
    
    return AwsRouteTablesAppView;
});
