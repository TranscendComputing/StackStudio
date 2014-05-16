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
        'text!templates/account/cloudCredentialManagementListTemplate.html',
        'collections/cloudCredentials',
        'views/account/cloudCredentialCreateView',
        'views/account/groupManageUsersView',
        'jquery.dataTables',
        'jquery.dataTables.fnProcessingIndicator'
], function( $, _, Backbone, Common, cloudCredentialManagementListTemplate, CloudCredentials, CreateCloudCredentialView, ManageGroupUsers ) {

    var CloudCredentialManagementListView = Backbone.View.extend({

        tagName: 'div',

        template: _.template(cloudCredentialManagementListTemplate),
        
        rootView: undefined,

        groups: undefined,

        selectedGroup: undefined,

        events: {
            "click #create_group_button" : "createGroup",
            "click #delete_group_button" : "deleteGroup",
            'click #group_users_table tr': 'selectGroup'
        },

        initialize: function() {
            this.$el.html(this.template);
            this.rootView = this.options.rootView;
            $("#submanagement_app").html(this.$el);
            $("button").button();
            $("#group_users_table").dataTable({
                "bJQueryUI": true,
                "bProcessing": true
            });
            var groupsView = this;
            //Common.vent.off("groupRefresh");
            Common.vent.on("cloudCredentialCreated", function() {
                groupsView.render();
                groupsView.rootView.cloudCredentials.fetch({
                    reset: true
                });
            });

            Common.vent.on("cloudCredentialsRefresh", function() {
                groupsView.rootView.cloudCredentials.fetch({
                    reset: true
                });
            });
            
            Common.vent.on("cloudCredentialDeleted", function() {
                groupsView.render();
                groupsView.rootView.cloudCredentials.fetch({
                    reset: true
                });
            });
            this.selectedGroup = undefined;
            //this.groups = this.rootView.cloudCredentials;
            this.groups = new CloudCredentials();
            this.groups.on('reset', this.addAllGroups, this);
            this.render();
        },

        render: function () {
            var self = this;
            this.disableSelectionRequiredButtons(true);
            $("#group_users_table").dataTable().fnClearTable();
            
            var groupListView = this;
            
            this.groups.fetch({
                reset: true
            });
        },
        
        selectGroup: function(event){
            $("#group_users_table tr").removeClass('row_selected');
            $(event.currentTarget).addClass('row_selected');
            
            var rowData = $("#group_users_table").dataTable().fnGetData(event.currentTarget);
            this.selectedGroup = this.groups.get($.parseHTML(rowData[0])[0]);
            
            if(this.selectedGroup) {
                this.disableSelectionRequiredButtons(false);
            }
        },
        
        addAllGroups: function() {
            $("#group_users_table").dataTable().fnClearTable();
            $.each(this.groups.models, function(index, value) {
                var rowData = ['<a href="#account/management/cloud-credentials" id="'+value.attributes.id+'" class="credential_item">'+value.attributes.name+"</a>",value.attributes.cloud_provider];
                $("#group_users_table").dataTable().fnAddData(rowData);
            });
        },

        disableSelectionRequiredButtons: function(toggle) {
            if(toggle) {
                $("#delete_group_button").attr("disabled", true);
                $("#delete_group_button").addClass("ui-state-disabled");
                $("#delete_group_button").removeClass("ui-state-hover");
                $("#manage_group_users_button").attr("disabled", true);
                $("#manage_group_users_button").addClass("ui-state-disabled");
            }else {
                $("#delete_group_button").removeAttr("disabled");
                $("#delete_group_button").removeClass("ui-state-disabled");
                $("#manage_group_users_button").removeAttr("disabled");
                $("#manage_group_users_button").removeClass("ui-state-disabled");
            }
        },

        createGroup: function() {
            new CreateCloudCredentialView({rootView: this.rootView});
            //alert("Create Cloud Credential");
        },

        deleteGroup: function() {
            if(this.selectedGroup) {
                this.groups.deleteCredential(this.selectedGroup);
            }
        },

        clearSelection: function() {
            this.selectedGroup = undefined;
            $(".group_item").removeClass("selected_item");
        },

        close: function(){
            this.$el.remove();
        }  
    });

    return CloudCredentialManagementListView;
});