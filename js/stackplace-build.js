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
    //appDir is incompatible with single file compilation
    //appDir: "../",
    baseUrl: "vendor",
    //dir is incompatible with "out"
    //dir: "../../StackStudio-build",
    out: "stackplace-all.min.js",
    name: "../main",
    include: [
              './common',
              // Copied from main.js innards; nested requires aren't loaded.
              'views/accountLoginView',
              'views/projectSidebarView',
              'views/projectAppView',
              'views/projectResourceSidebarView',
              'views/projectEditView',
              'views/resource/resourceNavigationView',
              ],
    excludeShallow: ['jquery.jstree'], // doesn't play well minified.
    mainConfigFile: 'common.js',

    optimize: "uglify2",
    generateSourceMaps: true,
    preserveLicenseComments: false, // required for source maps
    //logLevel: 0,

    paths: {
        // r.js can't find this file.
        common: '../common',
    }
})
