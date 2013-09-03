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

    // App Model
    // ----------

    /**
     * Our basic **Offering** model has name, versions
     *
     * @name Offering
     * @constructor
     * @param {Object} initialization object.
     * @returns {Object} Returns a Offering instance.
     */
    var Portfolio = Backbone.Model.extend({

        /** Default attributes for the cookbook */
        defaults: {
            name: 'New Portfolio',
            id: "",
            description: "",
            version: "",
            offerings: [] //TODO: Do we want an Offerings collection?
        },

        validate: function(portfolio, opts){
            var errors = [];
            //TODO: Add validations
            if (!portfolio.name){
                errors.push({name: 'nameRequired', message: 'Name is required.'});
            }

            return errors.length > 0 ? errors : false;
        }

    });

    return Portfolio;
});