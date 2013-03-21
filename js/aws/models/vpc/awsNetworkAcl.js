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

    // Base NetworkAcl Model
    // ----------

    /**
     *
     * @name NetworkAcl
     * @constructor
     * @category ObjectStorage
     * @param {Object} initialization object.
     * @returns {Object} Returns a NetworkAcl instance.
     */
    var NetworkAcl = Backbone.Model.extend({

        idAttribute: "networkAclId",
        
        /** Default attributes for compute */
        defaults: {
            "networkAclId": '',
            "vpcId": '',
            "default": '',
            "entrySet": [],
            "associationSet": [],
            "tagSet": []
		},

	    /**
	     * Override the base Backbone set method, for debugging.
	     *
	     * @memberOf NetworkAcl
	     * @category Internal
	     * @param {Object} hash of attribute values to set.
	     * @param {Object} (optional) options to tweak (see Backbone docs).
	     */
		set: function(attributes, options) {
		    Backbone.Model.prototype.set.apply(this, arguments);
		}
    });

    return NetworkAcl;
});
