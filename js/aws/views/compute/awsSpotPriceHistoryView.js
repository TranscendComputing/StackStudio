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
        'views/dialogView',
        'text!templates/aws/compute/awsSpotPriceHistoryTemplate.html',
        'aws/collections/compute/awsSpotPrices',
        'aws/collections/compute/awsFlavors',
        'aws/collections/compute/awsAvailabilityZones',
        'morris',
        'common',
        'jquery.multiselect',
        'jquery.multiselect.filter'
        
], function( $, _, Backbone, DialogView, spotPriceHistoryTemplate, SpotPrices, Flavors, AvailabilityZones, Morris, Common ) {
    
    var SpotPriceHistoryView = DialogView.extend({
        
        credentialId: undefined,

        region: undefined,

        flavors: new Flavors(),
        
        availabilityZones: new AvailabilityZones(),
        
        spotPrices: new SpotPrices(),
        
        events: {

        },

        initialize: function(options) {
            this.credentialId = options.cred_id;
            this.region = options.region;
            var createView = this;
            var compiledTemplate = _.template(spotPriceHistoryTemplate);
            this.$el.html(compiledTemplate);

            this.$el.dialog({
                autoOpen: true,
                title: "Spot Instance Price History",
                width: 800,
                resizable: false,
                modal: true,
                buttons: {
                    Close: function() {
                        createView.close();
                    }
                }
            });
            this.spotPrices.on( 'reset', this.renderPriceHistory, this );
            $("#product_select").change(function() {
                createView.getPriceHistory();
            });
            $("#date_range_select").change(function() {
                createView.getPriceHistory();
            });
            $("#az_select").change(function() {
                createView.getPriceHistory();
            });
            $("#flavor_select").change(function() {
                createView.getPriceHistory();
            });
            this.flavors.on( 'reset', this.addAllFlavors, this );
            this.flavors.fetch({ data: $.param({ cred_id: this.credentialId, region: this.region }), reset: true });
            
            this.availabilityZones.on( 'reset', this.addAllAvailabilityZones, this );
            this.availabilityZones.fetch({ data: $.param({ cred_id: this.credentialId, region: this.region }), reset: true });
        },

        render: function() {
            
        },
        
        addAllAvailabilityZones: function() {
            var createView = this;
            $("#az_select").empty();
            this.availabilityZones.each(function(az) {
                $("#az_select").append($("<option></option>").text(az.attributes.zoneName));
            });
            $("#az_select").change(function() {
                createView.getPriceHistory();
            });
            createView.getPriceHistory();
        },
        
        addAllFlavors: function() {
            var createView = this;
            $("#flavor_select").empty();
            this.flavors.each(function(flavor) {
                $("#flavor_select").append($("<option></option>").text(flavor.attributes.name));
            });
            $("#flavor_select").change(function() {
                createView.getPriceHistory();
            });
            createView.getPriceHistory();
        },
        
        getPriceHistory: function() {
            if($("#product_select").val() !== "" && $("#az_select").val() !== null && $("#flavor_select").val() !== null) {
                var filters = {};
                this.flavors.each(function(flavor) {
                    if(flavor.attributes.name === $("#flavor_select").val()) {
                        filters["instance-type"] = flavor.attributes.id;
                    } 
                 });
                filters["product-description"] = $("#product_select").val();
                filters["availability-zone"] = $("#az_select").val();
                this.spotPrices.fetch({ data: $.param({ "cred_id": this.credentialId, "region": this.region, "filters": filters }), reset: true });
            }
        },
        
        renderPriceHistory: function() {
            //Set timestamp to a readable format for Morris
            this.spotPrices.each(function(spotPrice) {
                var milisecondsTime = Date.parse(spotPrice.attributes.timestamp);
                var newTime = new Date(milisecondsTime).toISOString();
                newTime = newTime.replace("T", " ").replace(".000Z", "");
                spotPrice.attributes.timestamp = newTime;
            });
            $("#price_history_graph").empty();
            Morris.Line({
                element: 'price_history_graph',
                data: this.spotPrices.toJSON(),
                xkey: 'timestamp',
                ykeys: ['spotPrice'],
                labels: ['Price']
            });
        }

    });
    
    return SpotPriceHistoryView;
});
