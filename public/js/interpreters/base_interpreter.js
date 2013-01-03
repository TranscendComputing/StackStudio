/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
define([
        'underscore'
], function( _ ) {
    'use strict';

    // Core functionality for Cloud Interpreter
    // ----------------------------------------

    /**
     * Creates a base interpreter which serves as a base for any cloud compute dialect.
     *
     * @name BaseInterpreter
     * @constructor
     * @category Interpreter
     * @param {Object} initialization options.
     * @returns {Object} Returns a BaseInterpreter instance.
     */
    var BaseInterpreter = function(options) {
        this.options = options || {};
    };

    /**
     * Low level method invoke a command on the cloud.
     *
     * @static
     * @memberOf BaseInterpreter
     * @category Internal
     * @param {String} the command line string to invoke.
     * @param {Object} (optional) the initiating terminal that provided the command.
     * @returns {Object} An object with a message and type.
     * @example
     *
     * interpreter.execute("cloud-run-instances param param", term);
     * // => {'message': "Created instance", 'type': "success"};
     */
    BaseInterpreter.prototype.exec = function(command, term) {
        return {type: 'success', message: 'Ok.'};
    };

    return BaseInterpreter;
});
