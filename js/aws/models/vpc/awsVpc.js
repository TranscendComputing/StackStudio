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

    // Base Vpc Model
    // ----------

    /**
     *
     * @name Vpc
     * @constructor
     * @category ObjectStorage
     * @param {Object} initialization object.
     * @returns {Object} Returns a Vpc instance.
     */
    var Vpc = Backbone.Model.extend({

        idAttribute: "id",

        defaults: {
            id: '',
            state: '',
            cidr_block: '10.0.0.0/16',
            dhcp_options_id: '',
            tags: {},
            tenancy: 'default'
		}
    });

    return Vpc;
});
