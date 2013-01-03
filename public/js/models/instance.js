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

    // Instance Model
    // ----------

    /**
     * Our basic **Instance** model has `name`, `instanceId` and other
     * attributes of a running cloud virtual machine.
     *
     * @name Instance
     * @constructor
     * @category Resources
     * @param {Object} initialization object.
     * @returns {Object} Returns a Instance instance.
     */
    var Instance = Backbone.Model.extend({

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
	     * @memberOf Instance
	     * @category Internal
	     * @param {Object} hash of attribute values to set.
	     * @param {Object} (optional) options to tweak (see Backbone docs).
	     */
		set: function(attributes, options) {
		    Backbone.Model.prototype.set.apply(this, arguments);
		    //console.log("Setting attributes on model:", attributes);
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

    return Instance;
});
