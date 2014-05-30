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
  'text!templates/account/managementCloudAccountListTemplate.html',
  'collections/users',
  'collections/cloudAccounts',
  'views/account/cloudAccountCreateView',
  'jquery.dataTables',
  'jquery.dataTables.fnProcessingIndicator'
], function($, _, Backbone, Common, cloudAccountManagementListTemplate, Users, CloudAccounts, CloudAccountCreate) {

  var CloudAccountsManagementListView = Backbone.View.extend({

    tagName: 'div',

    template: _.template(cloudAccountManagementListTemplate),

    rootView: undefined,

    cloudAccounts: undefined,

    users: new Users(),

    selectedCloudAccount: undefined,

    CloudAccountCreateView: CloudAccountCreate,

    events: {
      "click #create_group_button": "createCloudAccount",
      "click #delete_group_button": "deleteCloudAccount",
      'click #group_users_table tr': 'selectCloudAccount'
    },

    initialize: function(options) {
      this.$el.html(this.template);
      this.rootView = options.rootView;
      $("#submanagement_app").html(this.$el);
      $("button").button();

      $("#group_users_table").dataTable({
        "bJQueryUI": true,
        "bProcessing": true
      });

      var managementView = this;
      Common.vent.on("managementRefresh", function() {
        managementView.render();
      });

      this.cloudAccounts = new CloudAccounts();
      this.rootView.cloudAccounts = this.cloudAccounts;
      this.cloudAccounts.on('reset', this.addAllCloudAccounts, this);
      this.render();
    },

    render: function() {
      this.disableSelectionRequiredButtons(true);
      $("#group_users_table").dataTable().fnClearTable();

      var listView = this;
      this.cloudAccounts.fetch({
        data: $.param({
          org_id: Common.account.org_id,
          account_id: Common.account.id
        }),
        reset: true,
        success: function() {
          listView.addAllCloudAccounts();
        }
      });
    },

    selectCloudAccount: function(event) {
      $("#group_users_table tr").removeClass('row_selected');
      $(event.currentTarget).addClass('row_selected');

      var rowData = $("#group_users_table").dataTable().fnGetData(event.currentTarget);

      this.selectedCloudAccount = this.cloudAccounts.get($.parseHTML(rowData[0])[0]);

      if (this.selectedCloudAccount) {
        this.disableSelectionRequiredButtons(false);
      }
    },

    addAllCloudAccounts: function() {
      this.rootView.addAll(this.cloudAccounts, $('#cloud_account_list'));
      $("#group_users_table").dataTable().fnClearTable();
      this.cloudAccounts.each(function(cloudAccount) {
        var auth_url = "";
        if (cloudAccount.attributes.url) {
          auth_url = cloudAccount.attributes.url;
        }

        var rowData = ['<a href="#cloud/setup/cloud-accounts/' + cloudAccount.attributes.id + '" id="' + cloudAccount.attributes.id + '" class="cloud_account_item">' + cloudAccount.attributes.name + "</a>", cloudAccount.attributes.cloud_provider, auth_url];
        $("#group_users_table").dataTable().fnAddData(rowData);
      });
    },

    disableSelectionRequiredButtons: function(toggle) {
      if (toggle) {
        $("#delete_group_button").attr("disabled", true);
        $("#delete_group_button").addClass("ui-state-disabled");
        $("#delete_group_button").removeClass("ui-state-hover");
        $("#manage_group_users_button").attr("disabled", true);
        $("#manage_group_users_button").addClass("ui-state-disabled");
      } else {
        $("#delete_group_button").removeAttr("disabled");
        $("#delete_group_button").removeClass("ui-state-disabled");
        $("#manage_group_users_button").removeAttr("disabled");
        $("#manage_group_users_button").removeClass("ui-state-disabled");
      }

      this.adminCheck();
    },

    adminCheck: function() {
      var cloudAccountsView = this;
      cloudAccountsView.users.fetch({
        success: function() {
          var isAdmin = false;
          if (cloudAccountsView.users.get(Common.account.id).attributes.permissions.length > 0) {
            isAdmin = cloudAccountsView.users.get(Common.account.id).attributes.permissions[0].permission.name === "admin";
          }
          if (!isAdmin) {
            $("#delete_group_button").attr("disabled", true);
            $("#delete_group_button").addClass("ui-state-disabled");
            $("#delete_group_button").removeClass("ui-state-hover");
            $("#create_group_button").attr("disabled", true);
            $("#create_group_button").addClass("ui-state-disabled");
          }
        }
      });
    },

    createCloudAccount: function() {
      var CloudAccountCreateView = this.CloudAccountCreateView;

      this.newResourceDialog = new CloudAccountCreateView({
        org_id: Common.account.org_id,
        account_id: Common.account.id,
        rootView: this.rootView
      });

      this.newResourceDialog.render();
    },

    deleteCloudAccount: function() {
      if (this.selectedCloudAccount) {
        this.selectedCloudAccount.destroy(Common.account.login);
      }
    },

    clearSelection: function() {
      this.selectedCloudAccount = undefined;
      $(".group_item").removeClass("selected_item");
    },

    close: function() {
      this.$el.remove();
    }
  });

  return CloudAccountsManagementListView;
});