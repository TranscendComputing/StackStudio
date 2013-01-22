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

    // Base Volume Model
    // ----------

    /**
     *
     * @name Volume
     * @constructor
     * @category BlockStorage
     * @param {Object} initialization object.
     * @returns {Object} Returns a Volume instance.
     */
    var Volume = Backbone.Model.extend({

        /** Default attributes for compute */
        defaults: {
			name: '',
			description: '',
			volumeId: '',
			size: '',
			snapshotId: '',
			zone: '',
			state: '',
			createTime: '-',
			attachmentSet: '',
			tagSet: '',
			volumeType: '',
			iops: ''
		},

	    /**
	     * Override the base Backbone set method, for debugging.
	     *
	     * @memberOf BloackStorage
	     * @category Internal
	     * @param {Object} hash of attribute values to set.
	     * @param {Object} (optional) options to tweak (see Backbone docs).
	     */
		set: function(attributes, options) {
		    Backbone.Model.prototype.set.apply(this, arguments);
		}
    });

    return Volume;
});
