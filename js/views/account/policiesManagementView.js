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
        'text!templates/account/policiesManagementTemplate.html',
        'collections/policies',
        'views/account/policyCreateView',
        'jquery.dataTables',
        'jquery.dataTables.fnProcessingIndicator'
], function( $, _, Backbone, Common, usersManagementTemplate, Users, NewLoginView) {

    var UserManagementView = Backbone.View.extend({

        tagName: 'div',

        template: _.template(usersManagementTemplate),

        users: undefined,

        selectedUser: undefined,

        events: {
            "click #users_table tr": "selectUser",
            "click #create_user_button": "createUser",
            "click #delete_user_button": "deleteUser"
        },

        initialize: function() {
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
            
            this.users = new Users();
            this.users.on('reset', this.addAllUsers, this);
            this.render();
        },

        render: function () {
            $("#users_table").dataTable().fnProcessingIndicator(true);
            this.users.fetch({
                data: $.param({ org_id: sessionStorage.org_id }),
                reset: true
            });
            this.disableDeleteButton(true);
        },

        addAllUsers: function() {
            var usersView = this;
            $("#users_table").dataTable().fnClearTable();
            this.users.each(function(user) {
                var rowData = [user.attributes.name];
                $("#users_table").dataTable().fnAddData(rowData);
            });
            $("#users_table").dataTable().fnProcessingIndicator(false);
            
            //this.disableCreateButton();
        },

        selectUser: function(event) {
            this.clearSelection();
            $(event.currentTarget).addClass("row_selected");
            var rowData = $("#users_table").dataTable().fnGetData(event.currentTarget);
            var usersView = this;
            this.users.each(function(user) {
                if(user.attributes.name === rowData[0]) {
                    usersView.selectedUser = user;
                    /*
                    var isAdmin = false;
                    if(usersView.users.get(sessionStorage.account_id).attributes.permissions.length > 0){
                        isAdmin = usersView.users.get(sessionStorage.account_id).attributes.permissions[0].permission.name === "admin";
                    }
                    
                    if(sessionStorage.account_id === user.attributes.id || !isAdmin) {
                        usersView.disableDeleteButton(true);
                    }else {
                        usersView.disableDeleteButton(false);
                    }*/
                    usersView.disableDeleteButton(false);
                }
            });
        },

        disableDeleteButton: function(toggle) {
            if(toggle) {
                $("#delete_user_button").attr("disabled", true);
                $("#delete_user_button").addClass("ui-state-disabled");
            }else {
                $("#delete_user_button").removeAttr("disabled");
                $("#delete_user_button").removeClass("ui-state-disabled");
            }
        },
        /*
        disableCreateButton: function() {
            var isAdmin = false;
            if(this.users.get(sessionStorage.account_id).attributes.permissions.length > 0){
                isAdmin = this.users.get(sessionStorage.account_id).attributes.permissions[0].permission.name === "admin";
            }
            if(!isAdmin){
                $("#create_user_button").attr("disabled", true);
                $("#create_user_button").addClass("ui-state-disabled");
            }
        },*/

        createUser: function() {
            location.href = "#account/management/policy";
            //new NewLoginView({org_id: sessionStorage.org_id});
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
