/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
define([
        'models/resource/resourceModel',
        'backbone',
        'common'
], function( ResourceModel, Backbone, Common ) {
    'use strict';

    var ReservedInstancesOffering = ResourceModel.extend({
        idAttribute: "reservedInstancesOfferingId",

        defaults: {
            addButton: '<a href="" class="add_to_cart">Add</a>',
            removeButton: '<a href="" class="remove_from_cart">Remove</a>',
            desiredCount: '<input class="desired_count_input" value="1"></input>'
        },

        set: function(attributes, options) {
            if(!options.update)
            {
                attributes.term = (attributes.duration / 2628000).toString() + " months";
                attributes.upfrontPrice = "$" + (attributes.fixedPrice.toFixed(2));
                if(attributes.usagePrice.toFixed(3) === "0.000")
                {
                    attributes.hourlyRate = "$0.005";
                }else{
                    attributes.hourlyRate = "$" + attributes.usagePrice.toFixed(3);
                }
            }else{
                attributes.desiredCount = '<input class="desired_count_input" value=' + attributes.count + '></input>';
            }
            Backbone.Model.prototype.set.apply(this, arguments);
        }
    });

    return ReservedInstancesOffering;
});
