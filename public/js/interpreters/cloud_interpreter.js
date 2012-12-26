/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under MIT license <https://raw.github.com/TranscendComputing/StackStudio/master/LICENSE.md>
 */
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
     * @param {Object} initialization options.
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
    	exec: function(command, term) {
        	var result = {};
    		if (command.indexOf('cloud-run-instances') == 0) {
    			result.message = "Started 1 instance.";
    		} else if (command == 'cloud-describe-instances') {
    			result = "Displaying cloud instances.";
    		} else {
    			result.message = " Unsupported operation.";
    			result.type = "error";
    		}
    		return result;
    	}
    });

    return CloudInterpreter;
});
