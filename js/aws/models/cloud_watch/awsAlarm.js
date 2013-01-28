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
            AlarmName: '',
            ActionsEnabled: '',
            AlarmActions: [],
            AlarmArn: '',
            AlarmConfigurationUpdatedTimestamp: '',
            AlarmDescription: '',
            ComparisonOperator: '',
            Dimensions: [],
            EvaluationPeriods: 0,
            InsufficientDataActions: [],
            MetricName: '',
            Namespace: '',
            OKActions: [],
            Period: 0,
            StateReason: '',
            StateReasonData: '',
            StateUpdateTimestamp: '',
            StateValue: '',
            Statistic: '',
            Threshold: 0.0,
            Unit: ''
        }
    });

    return Alarm;
});
