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

    // App Model
    // ----------

    /**
     * Our basic **App** model has value, name, tool, id, tokens
     *
     * @name App
     * @constructor
     * @param {Object} initialization object.
     * @returns {Object} Returns a Project instance.
     */
    var App = Backbone.Model.extend({

        /** Default attributes for the project */
        defaults: {
            id: '',
            name: '',
            value: '', //TODO: Remove (transform later)?
            tool: '',
            tokens: [] //TODO: Remove (transform later)?
        }

    });

    return App;
});
