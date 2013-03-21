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
        'models/country',
        'common'
], function( $, Backbone, Country, Common ) {
    'use strict';

    // Country Collection
    // ---------------

    var CountryList = Backbone.Collection.extend({

        // Reference to this collection's model.
        model: Country,

        url: Common.apiUrl + '/identity/v1/accounts/countries.json',
        
        parse: function(resp) {
            return resp.countries;
        }
    });
    
    return CountryList;

});
