/*!
 * (c) Copyright 2012-2013 Transcend Computing, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an AS IS BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
		}
		
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
