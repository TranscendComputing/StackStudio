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

    // Base SecurityGroup Model
    // ----------

    /**
     *
     * @name SecurityGroup
     * @constructor
     * @category Compute
     * @param {Object} initialization object.
     * @returns {Object} Returns a SecurityGroup.
     */
    var SecurityGroup = Backbone.Model.extend({

        /** Default attributes for security group */
        defaults: {
            name: '-',
            description: ''
        }
    });

    return SecurityGroup;
});
