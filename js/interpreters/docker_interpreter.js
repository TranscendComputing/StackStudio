/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
define([
        'underscore',
        'common',
        'interpreters/base_interpreter'
], function( _, Common, BaseInterpreter ) {
    'use strict';

    // Standard Class for Docker Interpreter
    // ------------------------------------

    /**
     * The standard interpreter is the default Docker image build dialect
     *
     * @name DockerInterpreter
     * @constructor
     * @category Interpreter
     * @param {Object}
     *            initialization options.
     * @returns {Object} Returns a DockerInterpreter instance.
     */
    var DockerInterpreter = function(options) {
        this.options = options || {};
        this.tag = "docker";
        this.welcome = "Dockerfile";
        this.commands = ['apt-get',
                         'service'];
    };

    _.extend(DockerInterpreter.prototype, BaseInterpreter.prototype, {
        apt_get: function(command_line) {
            var result = {type: 'success'};
            // TODO: call backend
            result.message = "Install a package.";
            Common.vent.trigger('docker:add', command_line);
            return result;
        },
        service: function(command_line) {
            var result = {type: 'success'};
            // TODO: call backend
            result.message = "Service status.";
            return result;
        }
    });

    return DockerInterpreter;
});
