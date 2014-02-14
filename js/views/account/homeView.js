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
        'models/account',
        'jquery.dataTables',
        'jquery.dataTables.fnProcessingIndicator'
], function( $, _, Backbone, Common, usersManagementTemplate, NewLoginView, Account) {

    var UserManagementView = Backbone.View.extend({

        tagName: 'div',

        template: _.template(usersManagementTemplate),

        events: {
            "click #updateUserB":"setUser"
        },

        initialize: function() {
            this.$el.html(this.template);
            $("#submanagement_app").html(this.$el);
            this.render();
            
            this.account = new Account();
            var x = this;
            Common.vent.on("accountUpdate", function(data) {
                x.render();
                x.setAccountFields(data.account);
            });
            this.account.getUser();
        },

        render: function () {
            $("#username_label").html(sessionStorage.login);
        },
        
        setAccountFields: function(account){
            if(account.rss_url !== undefined){
                $("#rss_input").val(account.rss_url);
            }
        },
        
        setUser: function(){
            var issue = false;

            if($("#rss_input").val() === "") {
                issue = true;
            }
            if(!issue) {
                this.account.setUser({"account":{"rss_url":$("#rss_input").val()}});
            }else {
                Common.errorDialog("Invalid Request", "Cannot update empty field.");
            }
        },

        close: function(){
            this.$el.remove();
        }  
    });

    return UserManagementView;
});
