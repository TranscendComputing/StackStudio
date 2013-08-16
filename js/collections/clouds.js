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
        'models/cloud',
        'common'
], function( $, Backbone, Cloud, Common ) {
    'use strict';

    // Cloud Collection
    // ---------------

    var CloudList = Backbone.Collection.extend({

        // Reference to this collection's model.
        model: Cloud,

        url: Common.apiUrl + '/stackstudio/v1/clouds',
        
        parse: function(resp) {
            return resp.clouds;
        }
    });
    
    return new CloudList();

});
