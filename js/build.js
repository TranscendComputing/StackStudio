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
({
    appDir: "../",
    baseUrl: "js",
    dir: "../../StackStudio-build",
    modules: [
        {
            name: "main",
        },
        {
            name: "collections"
        }   
    ],
    paths: {
        collections: '../collections',
        models: '../models',
        routers: '../routers',
        views: '../views',
        interpreters: '../interpreters',
        templates: '../../templates',
        'jquery': '//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min',
        'jquery-ui': '//ajax.googleapis.com/ajax/libs/jqueryui/1.9.2/jquery-ui.min',
        'underscore': 'lodash',
        'backbone': 'backbone-0.9.9',
        'icanhaz': 'ICanHaz',
        'jquery.terminal': 'jquery.terminal-0.4.22',
        'jquery.mousewheel': 'jquery.mousewheel-min',
        'wijlist': 'jquery.wijmo.wijlist',
        'wijutil': 'jquery.wijmo.wijutil',
        'wijsuperpanel': 'jquery.wijmo.wijsuperpanel',
        'wijsplitter': 'jquery.wijmo.wijsplitter',
        'wijmo': 'jquery.wijmo-open.all.2.3.2.min'
    }
})