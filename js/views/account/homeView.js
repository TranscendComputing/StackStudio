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
/*global define:true console:true requirejs:true require:true*/
define([
        'jquery',
        'underscore',
        'backbone',
        'common',
        'text!templates/account/homeTemplate.html',
        'views/account/newLoginView',
        'jquery.dataTables',
        'jquery.dataTables.fnProcessingIndicator'
], function( $, _, Backbone, Common, usersManagementTemplate, NewLoginView) {

    var UserManagementView = Backbone.View.extend({

        tagName: 'div',

        template: _.template(usersManagementTemplate),

        events: {
        },

        initialize: function() {
            this.$el.html(this.template);
            $("#submanagement_app").html(this.$el);
            this.render();
        },

        render: function () {
            $("#username_label").html(sessionStorage.login);
        },

        close: function(){
            this.$el.remove();
        }  
    });

    return UserManagementView;
});
