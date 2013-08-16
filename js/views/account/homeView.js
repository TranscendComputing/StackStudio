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
