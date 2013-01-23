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
        '/js/aws/models/compute/awsElasticIP.js',
        'common'
], function( $, Backbone, ElasticIP, Common ) {
    'use strict';

    // ElasticIP Collection
    // ---------------

    var ElasticIPList = Backbone.Collection.extend({

        // Reference to this collection's model.
        model: ElasticIP,

        url: 'samples/elasticIPSample.json'
    });
    
    return new ElasticIPList();

});
