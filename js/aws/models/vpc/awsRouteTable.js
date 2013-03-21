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

    // Base RouteTable Model
    // ----------

    /**
     *
     * @name RouteTable
     * @constructor
     * @category ObjectStorage
     * @param {Object} initialization object.
     * @returns {Object} Returns a RouteTable instance.
     */
    var RouteTable = Backbone.Model.extend({

        idAttribute: "routeTableId",
        
        /** Default attributes for compute */
        defaults: {
            routeTableId: '',
            vpcId: '',
            routeSet: [],
            associationSet: [],
            propagatingVgwSet: [],
            tagSet: []
		},

	    /**
	     * Override the base Backbone set method, for debugging.
	     *
	     * @memberOf RouteTable
	     * @category Internal
	     * @param {Object} hash of attribute values to set.
	     * @param {Object} (optional) options to tweak (see Backbone docs).
	     */
		set: function(attributes, options) {
		    Backbone.Model.prototype.set.apply(this, arguments);
		},
		
		/*
		get: function(attr) {
		    if (typeof this[attr] == 'function') {
		        return this[attr]();
		    }
		    
		    return Backbone.Model.prototype.get.call(this, attr);
		}
		*/
    });

    return RouteTable;
});
