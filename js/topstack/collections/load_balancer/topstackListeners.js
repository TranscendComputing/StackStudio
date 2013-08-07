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
        '/js/topstack/models/load_balancer/topstackListener.js',
        'common'
], function( $, Backbone, Listener, Common ) {
    'use strict';

    var ListenerList = Backbone.Collection.extend({

        model: Listener,

        initialize: function(options) {
            this.url = Common.apiUrl + '/stackstudio/v1/cloud_management/topstack/load_balancer/load_balancers/'+ options["load_balancer_id"] +'/listeners';
        }
        
    });

    return ListenerList;

});
