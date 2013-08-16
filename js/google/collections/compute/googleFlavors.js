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
        '/js/google/models/compute/googleFlavor.js',
        'common'
], function( $, Backbone, Flavor, Common ) {
    'use strict';

    var FlavorList = Backbone.Collection.extend({

        model: Flavor,

        url: Common.apiUrl + '/stackstudio/v1/cloud_management/google/compute/flavors'
    });
    
    return FlavorList;

});
