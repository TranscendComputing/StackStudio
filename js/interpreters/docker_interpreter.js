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
        apt_get: function() {
            var result = {type: 'success'};
            // TODO: call backend
            result.message = "Install a package.";
            return result;
        },
        service: function() {
            // TODO: call backend
            result.message = "Service status.";
            return result;
        }
    });

    return DockerInterpreter;
});
