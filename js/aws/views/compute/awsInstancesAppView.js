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
        'text!templates/aws/compute/awsInstanceAppTemplate.html',
        '/js/aws/models/compute/awsInstance.js',
        '/js/aws/collections/compute/awsInstances.js',
        '/js/aws/views/compute/awsInstanceCreateView.js',
        '/js/aws/models/cloud_watch/awsDataPoint.js',
        '/js/aws/collections/cloud_watch/awsDataPoints.js',
        'icanhaz',
        'common',
        'morris',
        'spinner',
        'jquery.dataTables'
], function( $, _, Backbone, ResourceAppView, awsInstanceAppTemplate, Instance, instances, AwsInstanceCreate, DataPoint, DataPoints, ich, Common, Morris, Spinner ) {
    'use strict';

    // Aws Instance Application View
    // ------------------------------

    /**
     * AwsInstancesAppView is UI view list of cloud instances.
     *
     * @name InstanceAppView
     * @constructor
     * @category Resources
     * @param {Object} initialization object.
     * @returns {Object} Returns a AwsInstancesAppView instance.
     */
    var AwsInstancesAppView = ResourceAppView.extend({
        template: _.template(awsInstanceAppTemplate),
        
        modelStringIdentifier: "instanceId",
        
        columns: ["name", "instanceId", "keyName", "running"],
        
        idColumnNumber: 1,
        
        model: Instance,
        
        collection: instances,
        
        type: "compute",
        
        subtype: "instances",
        
        initialMonitorLoad: false,
        
        CreateView: AwsInstanceCreate,
        
        cpuDataPoints: [],
        diskReadDataPoints: [],
        
        events: {
            'click .create_button': 'createNew',
            'click #resource_table tr': 'toggleActions',
            'click #monitoring': 'loadMonitors'
        },

        initialize: function() {
            this.render();
            $("#action_menu").on( "menuselect", this.setAction );
        },
        
        setAction: function(e, ui) {
            console.log(e, ui);
            console.log("PERFORMING ACTION");
            return false
        },
        
        toggleActions: function(e) {
            this.clickOne(e);
            var rowData = this.$table.fnGetData(e.currentTarget);
            if (rowData[3]) {
                console.log($("#action_menu").menu("widget"));
            }
        },
        
        loadMonitors: function() {
            var opts = {
                    lines: 13, // The number of lines to draw
                    length: 7, // The length of each line
                    width: 4, // The line thickness
                    radius: 10, // The radius of the inner circle
                    corners: 1, // Corner roundness (0..1)
                    rotate: 0, // The rotation offset
                    color: '#000', // #rgb or #rrggbb
                    speed: 1, // Rounds per second
                    trail: 60, // Afterglow percentage
                    shadow: false, // Whether to render a shadow
                    hwaccel: false, // Whether to use hardware acceleration
                    className: 'spinner', // The CSS class to assign to the spinner
                    zIndex: 2e9, // The z-index (defaults to 2000000000)
                    top: 'auto', // Top position relative to parent in px
                    left: 'auto' // Left position relative to parent in px
            };
            new Spinner(opts).spin($("#cpuGraph"));
            new Spinner(opts).spin($("#diskReadGraph"));

            this.cpuDataPoints = new DataPoints();
            this.cpuDataPoints.url = "samples/cpuDataPoints.json";
            this.cpuDataPoints.on( 'reset', this.cpuDataPointsFunc, this );
            this.cpuDataPoints.fetch();
            
            this.diskReadDataPoints = new DataPoints();
            this.diskReadDataPoints.url = "samples/diskReadDataPoints.json";
            this.diskReadDataPoints.on( 'reset', this.diskReadDataPointsFunc, this );
            this.diskReadDataPoints.fetch();
            
        },
        
        cpuDataPointsFunc: function() {
            Morris.Line({
                element: 'cpuGraph',
                data: this.cpuDataPoints.toJSON(),
                xkey: 'Timestamp',
                ykeys: ['Average'],
                ymax: ['100'],
                labels: ['CPU']
            });
        },
        
        diskReadDataPointsFunc: function() {
            Morris.Line({
                element: 'diskReadGraph',
                data: this.diskReadDataPoints.toJSON(),
                xkey: 'Timestamp',
                ykeys: ['Average'],
                labels: ['Disk Reads'],
                lineColors: ["#FF8000"]
            });
        }
    });
    
    return AwsInstancesAppView;
});
