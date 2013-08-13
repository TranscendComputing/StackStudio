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
        'jquery',
        'underscore',
        'backbone',
        '/js/openstack/models/identity/openstackUser.js',
        'common'
], function( $, _, Backbone, User, Common ) {
    'use strict';

    var UserList = Backbone.Collection.extend({

        model: User,

        url: Common.apiUrl + '/stackstudio/v1/cloud_management/openstack/identity/users',

        without: function(collection) {
            var result = new Backbone.Collection();
            _.each(this.models, function(model) {
                if(!collection.get(model.id))
                {
                    result.add(model);
                }
            });
            return result;
        }
    });

    return UserList;

});
