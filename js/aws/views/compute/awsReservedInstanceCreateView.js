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
        'text!templates/aws/compute/awsReservedInstanceCreateTemplate.html',
        '/js/aws/models/compute/awsReservedInstance.js',
        'icanhaz',
        'common',
        'jquery.ui.selectmenu'
        
], function( $, _, Backbone, reservedInstanceCreateTemplate, ReservedInstance, ich, Common ) {
    
    var platformList = [
                        "Linux/UNIX",
                        "Linux/UNIX (Amazon VPC)",
                        "SUSE Linux",
                        "SUSE Linux (Amazon VPC)",
                        "Red Hat Enterprise Linux",
                        "Red Hat Enterprise Linux (Amazon VPC)",
                        "Windows",
                        "Windows (Amazon VPC)",
                        "Windows with SQL Server Standard",
                        "Windows with SQL Server Standard (Amazon VPC)",
                        "Windows with SQL Server Web",
                        "Windows with SQL Server Web (Amazon VPC)"
                       ];
    
    var azList = ["us-east-1a", "us-east-1b", "us-east-1d"];
    
    var instanceTypes = [
                        "t1.micro", 
                        "m1.small",
                        "m1.medium", 
                        "m1.large", 
                        "m1.xlarge",
                        "m3.xlarge", 
                        "m3.2xlarge",
                        "m2.xlarge", 
                        "m2.2xlarge", 
                        "m2.4xlarge",
                        "c1.medium", 
                        "c1.xlarge",
                        "cc1.4xlarge", 
                        "cc2.8xlarge", 
                        "cr1.8xlarge",
                        "cg1.4xlarge", 
                        "hi1.4xlarge",
                        "hs1.8xlarge"
                       ];
    
    var termList = [
                    "1 month - 6 months",
                    "7 months - 12 months",
                    "1 year - 2 years",
                    "2 years - 3 years"
                   ];
    
    var offeringTypes = [
                         "Light Utilization",
                         "Medium Utilization", 
                         "Heavy Utilization"
                        ];

    var ReservedInstanceCreateView = Backbone.View.extend({
        
        tagName: "div",
        
        // Delegated events for creating new instances, etc.
        events: {
            "dialogclose": "close"
        },

        initialize: function() {
            var createView = this;
            var compiledTemplate = _.template(reservedInstanceCreateTemplate);
            this.$el.html(compiledTemplate);

            this.$el.dialog({
                autoOpen: true,
                title: "Purchase Reserved Instance",
                width:450,
                minHeight: 150,
                resizable: false,
                modal: true,
                buttons: {
                    Create: function () {
                        createView.create();
                    },
                    Cancel: function() {
                        createView.cancel();
                    }
                }
            });
            
            $.each(platformList, function (index, value) {
                $('#platform_select')
                    .append($("<option></option>")
                    .attr("value",index)
                    .text(value));
            });
            
            $.each(instanceTypes, function (index, value) {
                $('#instance_type_select')
                    .append($("<option></option>")
                    .attr("value",index)
                    .text(value));
            });
            
            $.each(azList, function (index, value) {
                $('#az_select')
                    .append($("<option></option>")
                    .attr("value",index)
                    .text(value));
            });
            
            $.each(termList, function (index, value) {
                $('#term_select')
                    .append($("<option></option>")
                    .attr("value",index)
                    .text(value));
            });
            
            $.each(offeringTypes, function (index, value) {
                $('#offering_type_select')
                    .append($("<option></option>")
                    .attr("value",index)
                    .text(value));
            });
            
            $("select").selectmenu();
        },

        render: function() {
            
        },
        
        close: function() {
            console.log("close initiated");
            $('#platform_select').remove();
            $('#instance_type_select').remove();
            $('#az_select').remove();
            $('#term_select').remove();
            $('#offering_type_select').remove();
            this.$el.dialog('close');
        },
        
        cancel: function() {
            this.$el.dialog('close');
        },
        
        create: function() {
            console.log("create_initiated");
            //Validate and create
            this.$el.dialog('close');
        }

    });

    console.log("aws instance create view defined");
    
    return ReservedInstanceCreateView;
});
