/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
define([
        'underscore',
        'interpreters/base_interpreter'
], function( _, BaseInterpreter ) {
    'use strict';

    // Standard Class for Cloud Interpreter
    // ------------------------------------

    /**
     * The standard interpreter is the default cloud compute dialect
     *
     * @name CloudInterpreter
     * @constructor
     * @category Interpreter
     * @param {Object}
     *            initialization options.
     * @returns {Object} Returns a CloudInterpreter instance.
     */
    var CloudInterpreter = function(options) {
        this.options = options || {};
        this.commands = ['cloud-run-instances',
                         'cloud-describe-instances',
                         'cloud-allocate-address',
                         'cloud-create-volume'];
    };

    _.extend(CloudInterpreter.prototype, BaseInterpreter, {
        exec2: function(command, term) {
            var result = {type: 'success'};
            if (command.indexOf('cloud-run-instances') === 0) {
                result.message = "Started 1 instance.";
            } else if (command.indexOf('cloud-describe-instances') === 0) {
                result.message = "Displaying cloud instances.";
            } else {
                result.message = " Unsupported operation.";
                result.type = "error";
            }
            return result;
        },
        exec: function(command, term) {
            var result = {type: 'success'};
            if (command.indexOf('cloud-run-instances') === 0) {
                result.message = "Started 1 instance.";
            } else if (command.indexOf('cloud-describe-instances') === 0) {
                result.message = "Displaying cloud instances.";
            } else {
                result.message = " Unsupported operation.";
                result.type = "error";
            }
            return result;
        }
    });

    return CloudInterpreter;
});
