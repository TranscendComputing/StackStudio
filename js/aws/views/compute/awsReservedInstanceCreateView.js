/*!
 * (c) Copyright 2012-2013 Transcend Computing, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an AS IS BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
        'text!templates/aws/compute/awsReservedInstanceCreateTemplate.html',
        '/js/aws/models/compute/awsReservedInstance.js',
        '/js/aws/collections/compute/awsReservedInstancesOfferings.js',
        'icanhaz',
        'common',
        'jquery.ui.selectmenu',
        'jquery.dataTables',
        'dataTables.fnReloadAjax'
        
], function( $, _, Backbone, DialogView, reservedInstanceCreateTemplate, ReservedInstance, ReservedInstancesOfferings, ich, Common ) {

    var ReservedInstanceCreateView = DialogView.extend({
        offerings: new ReservedInstancesOfferings(),
        cartOfferings: new ReservedInstancesOfferings(),
        template: _.template(reservedInstanceCreateTemplate),
        // Delegated events for creating new instances, etc.
        events: {
            "dialogclose": "close",
            "click button#search_button": "performSearch",
            "click a.add_to_cart": "addToCart",
            "click a.remove_from_cart": "removeFromCart",
            "change input.desired_count_input": "updateCount"
        },

        reservedInstance: new ReservedInstance(),

        initialize: function(options) {
            this.credentialId = options.cred_id;
            this.region = options.region;
            this.cartOfferings.credentialId = this.credentialId;
            this.offerings.on("reset", this.refreshTable, this);
            this.render();
            this.refreshView(1);
        },

        next: function() {
            if(this.currentViewIndex === 2) {
                this.create();
            }else {
                this.currentViewIndex++;
                this.refreshView(this.currentViewIndex);
            }
        },

        previous: function() {
            this.currentViewIndex--;
            this.refreshView(this.currentViewIndex);
        },

        refreshView: function (viewIndex) {
            $(".view_stack").hide();
            $("#view"+viewIndex).show();
            this.currentViewIndex = viewIndex;

            if(this.currentViewIndex === 1) {
                $("#previous_button").addClass("ui-state-disabled");
                $("#previous_button").attr("disabled", true);
            }else {
                $("#previous_button").removeClass("ui-state-disabled");
                $("#previous_button").attr("disabled", false);
            }

            if(this.currentViewIndex === 2) {
                $("#next_button span").text("Purchase");
            }else {
                $("#next_button span").text("View Cart");
            }
            $("#next_button").button();
        },

        render: function() {
            var view = this;
            this.$el.html(this.template);
            this.$("button").button();

            this.$el.dialog({
                autoOpen: true,
                title: "Purchase Reserved Instance",
                width:800,
                minHeight: 400,
                resizable: false,
                modal: true,
                buttons: {
                    Previous: {
                        text: "Back",
                        id: "previous_button",
                        click: function() {
                            view.previous();
                        }
                    },
                    ViewCart: {
                        text: "View Cart",
                        id: "next_button",
                        click: function() {
                            view.next();
                        }
                    }
                }
            });
            $("select").selectmenu();

            $("table.offerings_table").hide();
            this.$table = $('table.offerings_table').dataTable({
                "bJQueryUI": true,
                "aoColumns": [
                    {"sTitle": "Platform", "mDataProp": "productDescription"},
                    {"sTitle": "Term", "mDataProp": "term"},
                    {"sTitle": "Upfront Price", "mDataProp": "upfrontPrice"},
                    {"sTitle": "Hourly Rate", "mDataProp": "hourlyRate"},
                    {"sTitle": "Availability Zone", "mDataProp": "availabilityZone"},
                    {"sTitle": "Offering Type", "mDataProp": "offeringType"},
                    {"sTitle": "", "mDataProp": "addButton"}
                ],
                sDefaultContent: "",
                sAjaxDataProp: "",
                fnServerData: function(sSource, aoData, fnCallback) {
                    fnCallback(view.offerings.toJSON());
                }
            }, view);
            $("div#details").hide();

            this.renderCart();
            ich.grabTemplates();
        },

        renderCart: function() {
            var view = this;
            this.$cart = $('table.cart_table').dataTable({
                "bJQueryUI": true,
                "bFilter": false,
                "bInfo": false,
                "aoColumns": [
                    {"sTitle": "Platform", "mDataProp": "productDescription"},
                    {"sTitle": "Term", "mDataProp": "term"},
                    {"sTitle": "Upfront Price", "mDataProp": "upfrontPrice"},
                    {"sTitle": "Hourly Rate", "mDataProp": "hourlyRate"},
                    {"sTitle": "Availability Zone", "mDataProp": "availabilityZone"},
                    {"sTitle": "Offering Type", "mDataProp": "offeringType"},
                    {"sTitle": "Desired Count", "mDataProp": "desiredCount"},
                    {"sTitle": "", "mDataProp": "removeButton"}
                ],
                sDefaultContent: "",
                sAjaxDataProp: "",
                fnServerData: function(sSource, aoData, fnCallback) {
                    fnCallback(view.cartOfferings.toJSON());
                }
            }, view);
            this.$cart.fnReloadAjax();
            this.refreshView(1);
        },

        create: function() {
            this.cartOfferings.region = this.region;
            this.cartOfferings.purchase();
            this.$el.dialog('close');
        },

        performSearch: function() {
            $("div#details").hide();
            var options = {};
            if($('#zone_select').selectmenu("value") !== "Any")
            {
                options["availability-zone"] = $("#zone_select").val();
            }
            if($("#term_select").selectmenu("value") !== "Any")
            {
                options["term"] = $("#term_select").val();
            }
            options["instance-type"] = $("#type_select").val();
            options["product-description"] = $("#platform_select").val();
            this.offerings.fetch({
                data: {cred_id: this.credentialId, filters: options, region: this.region},
                reset: true
            });
            this.refreshTable();
        },

        addToCart: function(event) {
            var row = event.currentTarget.parentElement.parentElement,
                data = this.$table.fnGetData(row);
            this.cartOfferings.add(data);
            this.$cart.fnReloadAjax();
            var count = this.$cart.fnGetData().length;
            var details = this.calculatePrice(this.$cart);
            $("#cart_total").html(ich['total_template'](details));
            $("#notif").html(ich['notif_template']({count: count}));
            return false;
        },

        refreshTable: function() {
            $("table.offerings_table").hide();
            $("table.offerings_table").show();
            var offeringsTable = $("table.offerings_table").dataTable();
            offeringsTable.fnReloadAjax();
        },

        removeFromCart: function(event) {
            var row = event.currentTarget.parentElement.parentElement,
                data = this.$cart.fnGetData(row);
            this.$cart.fnDeleteRow(row);    
            this.cartOfferings.remove(data);
            var count = this.$cart.fnGetData().length;
            var details = this.calculatePrice(this.$cart);
            $("#cart_total").html(ich['total_template'](details));
            $("#notif").html(ich['notif_template']({count: count}));
            return false;
        },

        calculatePrice: function(cartTable) {
            var count = cartTable.fnGetData().length;
            var total = 0;
            var amt, usagePrice;
            _.each(cartTable.fnGetData(), function(offering) {
                if(offering.usagePrice.toFixed(3) === "0.000")
                {
                    usagePrice = 0.005;
                }else{
                    usagePrice = offering.usagePrice;
                }
                amt = usagePrice * (offering.duration / 60) + offering.fixedPrice;
                if(offering.count)
                {
                    count = count + (offering.count - 1);
                    total = total + offering.count * (amt + offering.fixedPrice);
                }else{
                    total = total + amt + offering.fixedPrice;
                }
            }, cartTable);
            total = "$" + total.toFixed(2);
            return {total: total, count: count};
        },

        updateCount: function(event) {
            var row = event.currentTarget.parentElement.parentElement,
                data = this.$cart.fnGetData(row);  
            var offering = this.cartOfferings.get(data);
            var count = $(event.currentTarget).val();
            offering.set({count: count}, {update: true});
            this.$cart.fnReloadAjax();
            var details = this.calculatePrice(this.$cart);
            $("#cart_total").html(ich['total_template'](details));
        }

    });

    console.log("aws instance create view defined");
    
    return ReservedInstanceCreateView;
});
