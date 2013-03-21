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

    // Cloud Service Model
    // ----------

    /**
     *
     * @name CloudService
     * @constructor
     * @category Account
     * @param {Object} initialization object.
     * @returns {Object} Returns a CloudService instance.
     */
    var CloudService = Backbone.Model.extend({

        /** Default attributes for cloud service */
        defaults: {
            id: "",
            service_type: "",
            protocol: "",
            host: "",
            path: "",
            port: "",
            enabled: true
		}

    });

    return CloudService;
});
