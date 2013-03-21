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

    // Aws MetricStatistic Model
    // ----------

    /**
     *
     * @name MetricStatistic
     * @constructor
     * @category CloudWatch
     * @param {Object} initialization object.
     * @returns {Object} Returns an MetricStatistic.
     */
    var MetricStatistic = Backbone.Model.extend({

        /** Default attributes for DataPoint */
        defaults: {
            Timestamp: '',
            Unit: '',
            Average: 0.0
        }
    });

    return MetricStatistic;
});
