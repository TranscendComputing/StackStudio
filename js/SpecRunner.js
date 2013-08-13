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
BASE_URL = 'js/vendor';

EXTRA_PATHS = {};

// Add the following to allow tests to force a reload of JS every time.
var URL_ARGS = 'cb=' + Math.random();

require(['./common'], function (common) {
	require({
		paths: {
		    'jasmine-html': 'jasmine-1.3.1/jasmine-html',
			'jasmine': 'jasmine-1.3.1/jasmine'
		},
		shim: {
			jasmine: {
				exports: 'jasmine'
			},
			'jasmine-html': {
				deps: ['jasmine'],
				exports: 'jasmine'
			}

		}
	},
	['underscore', 'jquery', 'jasmine-html'], function(_, $, jasmine){
		var jasmineEnv = jasmine.getEnv();
		jasmineEnv.updateInterval = 1000;

	    var trivialReporter = new jasmine.TrivialReporter();

	    jasmineEnv.addReporter(trivialReporter);

		jasmineEnv.specFilter = function(spec) {
			return trivialReporter.specFilter(spec);
		};

		var specs = [];

		specs.push('../../spec/console');

		$(function(){
			require(specs, function(){
				jasmineEnv.execute();
		    });
		});

	});
});

