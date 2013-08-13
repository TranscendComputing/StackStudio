/*!
 * (c) Copyright 2012-2013 Transcend Computing, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an AS IS BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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

    _.extend(CloudInterpreter.prototype, BaseInterpreter.prototype, {
        cloud_run_instances: function() {
            return this.run_instances();
        },
        cloud_describe_instances: function() {
            return this.describe_instances();
        }
    });

    return CloudInterpreter;
});
