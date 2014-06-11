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
        'jquery.dataTables',
        'jquery.dataTables.fnProcessingIndicator'
], function( $, _, Backbone, Common, cloudCredentialManagementListTemplate, CloudCredentials, CreateCloudCredentialView ) {

    var CloudCredentialManagementListView = Backbone.View.extend({

        tagName: 'div',

        template: _.template(cloudCredentialManagementListTemplate),
        
        rootView: undefined,

        credentials: undefined,

        selectedCredential: undefined,

        events: {
            "click #create_group_button" : "createCredential",
            "click #delete_group_button" : "deleteCredential",
            'click #group_users_table tr': "selectCredential"
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
            var credentialsView = this;

            this.credentials = new CloudCredentials();
            this.rootView.credentials = this.credentials;
            this.credentials.on('reset', this.addAllCredentials, this);

            var self = this;
            Common.vent.on("cloudCredentialCreated", function() {
                credentialsView.render();
                self.credentials.fetch({
                    reset: true
                });
            });

            Common.vent.on("cloudCredentialsRefresh", function() {
                credentialsView.rootView.cloudCredentials.fetch({
                    reset: true
                });
            });
            
            Common.vent.on("cloudCredentialDeleted", function() {
                credentialsView.render();
                self.credentials.fetch({
                    reset: true
                });
            });

            this.selectedCredential = undefined;

            this.credentials.fetch({
                reset : true
            });

            this.render();
        },

        render: function () {
            this.disableSelectionRequiredButtons(true);
        },
        
        selectCredential: function ( event ) {
            $("#group_users_table tr").removeClass('row_selected');
            $(event.currentTarget).addClass('row_selected');
            
            var rowData = $("#group_users_table").dataTable().fnGetData(event.currentTarget);
            this.selectedCredential = this.credentials.get($.parseHTML(rowData[0])[0]);
            
            if(this.selectedCredential) {
                this.disableSelectionRequiredButtons(false);
            }
        },
        
        addAllCredentials: function() {
            this.rootView.addAll(this.credentials, $('#cred_list'));
            $("#group_users_table").dataTable().fnClearTable();
            this.credentials.each(function ( cred ) {
                var rowData = ['<a href="#cloud/setup/cloud-credentials/' + cred.attributes.id + '" id="'+ cred.attributes.id+'" class="credential_item">'+cred.attributes.name+"</a>",cred.attributes.cloud_provider];
                // XXX - This looks to be a copy and paste error. rename this table to something dealing with creds
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

        createCredential: function() {
            new CreateCloudCredentialView({rootView: this.rootView});
        },

        deleteCredential: function() {
            if(this.selectedCredential) {
                this.credentials.deleteCredential(this.selectedCredential);
            }
        },

        clearSelection: function() {
            this.selectedCredential = undefined;
            $(".group_item").removeClass("selected_item");
        },

        close: function(){
            this.$el.remove();
        }  
    });

    return CloudCredentialManagementListView;
});
