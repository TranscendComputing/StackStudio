/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
define([
        'jquery',
        'backbone',
        'common'
], function( $, Backbone, Common ) {
    'use strict';

    // Aws Metric Model
    // ----------

    /**
     *
     * @name Metric
     * @constructor
     * @category CloudWatch
     * @param {Object} initialization object.
     * @returns {Object} Returns a metric.
     */
    var Metric = Backbone.Model.extend({

        /** Default attributes for metric */
        defaults: {
            name: '',
            namespace: '',
            dimensions: []
        }
    });

    return Metric;
});
