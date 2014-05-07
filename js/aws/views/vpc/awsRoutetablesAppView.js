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
        '/js/views/featureNotImplementedDialogView.js',
        '/js/aws/views/vpc/awsRouteTableAssociateView.js',
        'icanhaz',
        'common',
        'jquery.dataTables'
], function( $, _, Backbone, AppView, awsRouteTableAppTemplate, RouteTable, RouteTables, awsRouteTableCreateView, FeatureNotImplementedDialogView, RouteTableAssociateView, ich, Common ) {
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
            'click .add-button': 'featureNotImplemented', //Remove when feture is implemented.
            'click #resource_table tr': 'clickOne',
            'click #add_association_button' : 'addAssociation',
            'click #associations_table tr': 'selectTableRow',
            'click #remove_association_button' : 'removeAssociation'
        },

        initialize: function(options) {
            if(options.cred_id) {
                this.credentialId = options.cred_id;
            }
            if(options.region) {
                this.region = options.region;
            }
            
            
            var routeTableApp = this;
            Common.vent.on("routeTableAppRefresh", function() {
                routeTableApp.render();
            });
            this.render();
        },

        toggleActions: function(e) {
            //Disable any needed actions
            this.routeTable = this.collection.get(this.selectedId);
            this.addTableDetails();
            this.addAllTableElements();
            this.toggleButton($(".remove-button"),true);
        },

        addTableDetails: function(){
            var model = this.routeTable;
                if(model.attributes.associations.length > 0){
                    var count = 0;
                    var totalsubnets = 0;
                    $.each(model.attributes.associations, function(j,association){
                        if(association.main === true){
                            count++;
                        }
                        if(association.subnetId){
                            totalsubnets++;
                        }
                    });
                    if(count > 0){
                        $("#main_route_table_info").text("True");
                    }else{
                        $("#main_route_table_info").text("False");
                    }
                    $("#subnet_association_info").text(totalsubnets.toString());
                }
            // });
        },

        toggleButton: function(target, toggle){
            if(toggle === true){
                target.attr("disabled", true);
                target.addClass("ui-state-disabled");
            }else{
                target.removeAttr("disabled");
                target.removeClass("ui-state-disabled");
            }
        },

        addAllTableElements: function(){
            var model = this.routeTable;
            if(model.attributes.length !== 0){
                $(".sub-route-table").dataTable().fnClearTable();
                $.each(model.attributes, function(attribute,value) {
                    if(attribute === "routes"){
                        $.each(value,function(i,route){
                            var rowData = [route.destinationCidrBlock,route.gatewayId,route.state];
                            $("#routes_table").dataTable().fnAddData(rowData);
                        });
                    }
                    else if(attribute === "associations"){
                        $.each(value,function(i,association){
                            var hasSubnet = "none";
                            if(association.subnetId){
                                hasSubnet = association.subnetId;
                            }
                            var rowData = [association.routeTableAssociationId,association.routeTableId,hasSubnet,association.main];
                            $("#associations_table").dataTable().fnAddData(rowData);
                        });
                    }
                    else if(attribute === "propagating_vpn"){
                        $.each(value,function(i,propagation){
                            var rowData = [propagation.vpc_id];
                            $("#route_propagation_table").dataTable().fnAddData(rowData);
                        });
                    }
                });
            }
        },

        performAction: function(event) {
            var routeTable = this.routeTable;
            
            switch(event.target.text)
            {
            case "Delete":
                routeTable.destroy(this.credentialId, this.region);
                break;
            }
        },

        addAssociation: function(event) {
            var thisView = this;

            new RouteTableAssociateView({routeTable: thisView.routeTable, cred_id: thisView.credentialId , region: thisView.region});
        },

        removeAssociation: function(event) {
            var thisView = this;
            var selectedRow = $(".sub-route-table .row_selected");
            var associationsTable = selectedRow.parents("table").dataTable();
            var associationId = associationsTable.fnGetData(selectedRow[0])[0];

            this.routeTable.disassociate({association_id: associationId}, thisView.credentialId, thisView.region );
        },

        selectTableRow: function(event){
            var target = event.currentTarget;

            $(".sub-route-table tr").removeClass('row_selected');
            $(target).addClass('row_selected');
            this.toggleButton($("#remove_association_button"),false);
        },

        //Remove once features have been implemented.
        featureNotImplemented: function(){
            var thisView = this;
            new FeatureNotImplementedDialogView({feature_url: "https://github.com/TranscendComputing/StackStudio/issues/11"});
        }
    });
    
    return AwsRouteTablesAppView;
});
