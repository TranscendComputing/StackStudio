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
        'text!templates/account/usersManagementTemplate.html',
        'collections/users',
        'views/account/newLoginView',
        'views/account/userUpdateView',
        'jquery.dataTables',
        'jquery.dataTables.fnProcessingIndicator'
], function( $, _, Backbone, Common, usersManagementTemplate, Users, NewLoginView, UserUpdateView) {

    var UserManagementView = Backbone.View.extend({

        tagName: 'div',

        template: _.template(usersManagementTemplate),

        users: undefined,

        selectedUser: undefined,

        events: {
            "click #users_table tr": "selectUser",
            "click #create_user_button": "createUser",
            "click #update_user_button": "updateUser",
            "click #delete_user_button": "deleteUser"
        },

        initialize: function ( options ) {
            this.$el.html(this.template);
            $("#submanagement_app").html(this.$el);
            $("button").button();
            $("#users_table").dataTable({
                "bJQueryUI": true,
                "bProcessing": true
            });
            var usersView = this;
            Common.vent.on("userRefresh", function() {
                usersView.render();
            });

            this.rootView = options.rootView;
            
            this.users = this.collection = this.rootView.users = new Users();
            this.users.on('reset', this.addAllUsers, this);
            this.render();
        },

        render: function () {
            $("#users_table").dataTable().fnProcessingIndicator(true);
            this.users.fetch({reset: true});
            this.disableButton("#delete_user_button",true);
            this.disableButton("#update_user_button",true);
        },

        addAllUsers: function() {
            var usersView = this;

            this.rootView.addAll(this.users, $('#user_list'));
            $("#users_table").dataTable().fnClearTable();
            this.users.each(function(user) {
                var rowData = [user.attributes.login, user.attributes.first_name, user.attributes.last_name, user.attributes.email, user.role()];
                $("#users_table").dataTable().fnAddData(rowData);
            });
            $("#users_table").dataTable().fnProcessingIndicator(false);
            
            this.disableCreateButton();
        },

        selectUser: function(event) {
            this.clearSelection();
            $(event.currentTarget).addClass("row_selected");
            var rowData = $("#users_table").dataTable().fnGetData(event.currentTarget);
            var usersView = this;
            this.users.each(function(user) {
                if(user.attributes.login === rowData[0]) {
                    usersView.selectedUser = user;
                    
                    var isAdmin = false;
                    if(usersView.users.get(sessionStorage.account_id).attributes.permissions.length > 0){
                        isAdmin = usersView.users.get(sessionStorage.account_id).attributes.permissions[0].permission.name === "admin";
                    }
                    
                    if(sessionStorage.account_id === user.attributes.id || !isAdmin) {
                        usersView.disableButton("#delete_user_button",true);
                        usersView.disableButton("#update_user_button",true);
                    }else {
                        usersView.disableButton("#delete_user_button",false);
                        usersView.disableButton("#update_user_button",false);
                    }
                }
            });
        },

        disableButton: function(id,toggle) {
            if(toggle) {
                $(id).attr("disabled", true);
                $(id).addClass("ui-state-disabled");
            }else {
                $(id).removeAttr("disabled");
                $(id).removeClass("ui-state-disabled");
            }
        },
        
        disableCreateButton: function() {
            var isAdmin = false;
            if(this.users.get(sessionStorage.account_id).attributes.permissions.length > 0){
                isAdmin = this.users.get(sessionStorage.account_id).attributes.permissions[0].permission.name === "admin";
            }
            if(!isAdmin){
                $("#create_user_button").attr("disabled", true);
                $("#create_user_button").addClass("ui-state-disabled");
            }
        },

        createUser: function() {
            new NewLoginView({org_id: sessionStorage.org_id});
        },
        updateUser: function(){
            var usersView = this;
            new UserUpdateView({org_id: sessionStorage.org_id, user: usersView.selectedUser});
        },
        deleteUser: function() {
            if(this.selectedUser) {
                this.selectedUser.destroy();
            }
        },

        clearSelection: function() {
            $("#users_table tr").removeClass("row_selected");
        },

        close: function(){
            this.$el.remove();
        }  
    });

    return UserManagementView;
});
