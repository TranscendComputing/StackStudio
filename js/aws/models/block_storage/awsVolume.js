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

        defaults: {
            id: '',
			attached_at: '',
			availability_zone: '',
			created_at: '',
			delete_on_termination: '',
			device: '',
			iops: '-',
			server_id: '',
			size: 0,
			snapshot_id: '',
			state: '',
			tags: {},
			type: ''
		}
    
    });

    return Volume;
});
