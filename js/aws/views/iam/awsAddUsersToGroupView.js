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
        'views/dialogView',
        'text!templates/aws/iam/awsAddUsersToGroupTemplate.html',
        '/js/aws/models/iam/awsGroup.js',
        '/js/aws/collections/iam/awsUsers.js',
        'common'      
], function( $, _, Backbone, DialogView, addUsersToGroupTemplate, Group, Users, Common ) {
    
    var addUsersToGroupView = DialogView.extend({

        template: _.template(addUsersToGroupTemplate),

        credentialId: undefined,

        group: undefined,

        groupUsers: undefined,

        users: undefined,

        events: {
            "dialogclose": "close"
        },

        initialize: function(options) {
            this.credentialId = options.cred_id;
            this.group = options.group;
            this.groupUsers = options.group_users;
            var addUsersView = this;
            this.$el.html(this.template);

            this.$el.dialog({
                autoOpen: true,
                title: "Add Users to Group",
                width:500,
                minHeight: 150,
                resizable: false,
                modal: true,
                buttons: {
                    Add: function () {
                        addUsersView.addUsers();
                    },
                    Cancel: function() {
                        addUsersView.cancel();
                    }
                }
            });
            $("#non_group_users_table").dataTable({
                "bJQueryUI": true,
                "sDom": "t",
                "sScrollY": "200px",
                "bPaginate": false,
                "bScrollCollapse": true
            });
            this.users = new Users();
            this.users.on('reset', this.addAllNonGroupUsers, this);
            this.users.fetch({ data: $.param({ cred_id: this.credentialId }), reset: true});
        },

        render: function() {
            
        },

        addAllNonGroupUsers: function() {
            var addUsersView = this;
            $("#non_group_users_table").dataTable().fnClearTable();
            this.users.each(function(user) {
                if(!addUsersView.isUserInGroup(user.attributes.id)) {
                    var rowData = ["<input id="+ user.attributes.id +" class='non_group_users' type='checkbox'/>", user.attributes.id];
                    $("#non_group_users_table").dataTable().fnAddData(rowData);
                }
            });
            $("#non_group_users_table").dataTable().fnAdjustColumnSizing();
        },

        isUserInGroup: function(userName) {
            var isUser = false;
            $.each(this.groupUsers, function(index, value) {
                if(userName === value.UserName) {
                    isUser = true;
                }
            });
            return isUser;
        },
        
        addUsers: function() {
            var addUsersView = this;
            $(":checked.non_group_users").each(function(index, value) {
                var user = {id: value.id};
                addUsersView.group.addUser(user, addUsersView.credentialId);
            });
            this.$el.dialog('close');
        }
    });
    
    return addUsersToGroupView;
});
