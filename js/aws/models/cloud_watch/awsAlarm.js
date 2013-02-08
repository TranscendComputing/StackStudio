/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
define([
        'jquery',
        'backbone'
], function( $, Backbone ) {
    'use strict';

    /**
     *
     * @name Alarm
     * @constructor
     * @category CloudWatch
     * @param {Object} initialization object.
     * @returns {Object} Returns a Alarm.
     */
    var Alarm = Backbone.Model.extend({

        /** Default attributes for alarm */
        defaults: {
            id: '',
            actions_enabled: '',
            alarm_actions: [],
            arn: '',
            alarm_configuration_updated_timestamp: '',
            alarm_description: '',
            comparison_operator: '',
            dimensions: [],
            evaluation_periods: 0,
            insufficient_data_actions: [],
            metric_name: '',
            namespace: '',
            ok_actions: [],
            period: 0,
            state_reason: '',
            state_reason_data: '',
            state_updated_timestamp: '',
            state_value: '',
            statistic: '',
            threshold: 0.0,
            unit: ''
        },
        
        get: function(attr) {
            if(typeof this[attr] == 'function') {
                var test = this[attr]();
                return test;
            }
            
            return Backbone.Model.prototype.get.call(this, attr);
        },
        
        threshold: function() {
            var comparisonSign = "";
            switch(this.attributes.comparison_operator)
            {
                    case "GreaterThanOrEqualToThreshold":
                            comparisonSign = ">="
                            break;
                    case "LessThanOrEqualToThreshold":
                            comparisonSign = "<="
                            break;
                    case "GreaterThanThreshold":
                            comparisonSign = ">"
                            break;
                    case "LessThanThreshold":
                            comparisonSign = "<"
                            break;
            }
            var timeLength = (this.attributes.period * this.attributes.evaluation_periods/60).toString();
            return this.attributes.metric_name + " " + comparisonSign + " " + this.attributes.threshold.toString() + " " + this.attributes.unit + " for " + timeLength + " minutes.";;
        }
    });

    return Alarm;
});
