/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
define([
        'jquery',
        'underscore',
        'backbone'
], function( $, _, Backbone ) {
    'use strict';

    // Configuration Manager Model
    // ----------

    /**
     *
     * @name ConfigManager
     * @constructor
     * @category Manager
     * @param {Object} initialization object.
     * @returns {Object} Returns a ConfigManager instance.
     */
    var ConfigManager = Backbone.Model.extend({

        /** Default attributes for cloud service */
        defaults: {
            enabled: true,
            auth_properties: {}
        },
        idAttribute: "_id",
        url: function() {
            var base = _.result(this, 'urlRoot') || _.result(this.collection, 'url') || this.urlError();
            if (this.isNew()) { return base; }
            return base + (base.charAt(base.length - 1) === '/' ? '' : '/') + encodeURIComponent(this.id) + "?org_id=" + sessionStorage.org_id;
        }

    });

    return ConfigManager;
});