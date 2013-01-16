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

    // Base Compute Model
    // ----------

    /**
     *
     * @name Compute
     * @constructor
     * @category Compute
     * @param {Object} initialization object.
     * @returns {Object} Returns a Instance instance.
     */
    var Compute = Backbone.Model.extend({

        /** Default attributes for the instance */
        defaults: {
			name: '-',
			description: '',
			instanceId: '',
			imageId: '',
			imageName: '-',
			zone: '',
			state: '',
			keypairName: '-',
			publicIp: '0.0.0.0',
			privateIp: '0.0.0.0',
			running: false
		},

	    /**
	     * Override the base Backbone set method, for debugging.
	     *
	     * @memberOf Compute
	     * @category Internal
	     * @param {Object} hash of attribute values to set.
	     * @param {Object} (optional) options to tweak (see Backbone docs).
	     */
		set: function(attributes, options) {
		    Backbone.Model.prototype.set.apply(this, arguments);
		},

	    /**
	     *  Toggle the `running` state of this instance.
	     *
	     * @memberOf Instance
	     * @category Convenience
	     */
		toggle: function() {
			this.save({
				running: !this.get('running')
			});
		}

    });

    return Compute;
});
