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
  'icanhaz',
  'text!templates/account/managementCloudCredentialsTemplate.html',
  'models/cloudCredential',
  'collections/cloudAccounts',
  'collections/cloudCredentials',
  'views/account/cloudCredentialFormView',
  'views/notificationDialogView',
  'jquery-plugins',
  'jquery-ui-plugins'
], function($, _, Backbone, Common, ich, managementCloudCredentialTemplate, CloudCredential, CloudAccounts, CloudCredentials, CloudCredentialFormView, NotificationDialogView) {

  var CloudCredentialManagementView = Backbone.View.extend({
    /** @type {String} DOM element to attach view to */
    tagName: 'div',
    /** @type {Collection} Database collection of cloud accounts */
    cloudCredentials: undefined,
    /** @type {Template} HTML template to generate view from */
    template: _.template(managementCloudCredentialTemplate),
    rootView: undefined,
    /** @type {Object} Object of events for view to listen on */
    events: {
      //"click button#new_credential": "newCredential",
      "click button#save_credential": "saveCredential",
      "click button#delete_credential": "deleteCredential"
      //"change select#cloud_accounts_select": "selectCloudAccount"
    },
    /** Constructor method for current view */
    initialize: function(options) {

      this.rootView = options.rootView;

      this.cloudCredentials = new CloudCredentials();
      this.cloudCredentials.reset(_.pluck(Common.credentials, "cloud_credential"));

      this.selectedCloudCredential = this.cloudCredentials.get(options.selectedId);

      this.subViews = [];
      //Render my own view
      this.render();
      //Add listener for form completion to enable buttons
      Common.vent.on("form:completed", this.registerNewCredential, this);
      Common.vent.on("cloudCredentialDeleted", this.notifyDeleted, this);
      Common.vent.on("cloudCredentialSaved", this.notifySaved, this);

    },
    /** Add all of my own html elements */
    render: function() {
      var thisView = this;
      if (!this.rootView.cloudAccounts) {
        this.rootView.cloudAccounts = new CloudAccounts();
        this.rootView.cloudAccounts.on('reset', this.rootView.addAll.bind(this.rootView, this.rootView.cloudAccounts, $('#cloud_account_list')));

        this.rootView.cloudAccounts.fetch({
          data: $.param({
            org_id: Common.account.org_id,
            account_id: Common.account.id
          }),
          success: function(cloudAccounts) {
            thisView.render();
          }
        });

        return;
      }

      //Render my template
      this.$el.html(this.template);
      $("#submanagement_app").html(this.$el);
      //$("div#detail_tabs").tabs();
      $("button").button({
        disabled: true
      });
      $("button#save_credential").hide();

      $("#cloud_account_label").html(this.rootView.cloudAccounts.get(this.selectedCloudCredential.attributes.cloud_account_id).attributes.name);
      this.renderCredentialForm();
      $("button#delete_credential").button("option", "disabled", false);

      if (this.rootView.afterSubAppRender) {
        this.rootView.afterSubAppRender.call(this.rootView);
      }
    },

    renderCredentialForm: function() {
      if (this.subViews.length !== 0) {
        this.subViews[0].close();
      }
      this.credentialForm = new CloudCredentialFormView({
        model: this.selectedCloudCredential
      });
      $('button').button();
      $("button#save_credential").show();
      this.subViews.push(this.credentialForm);
    },

    clearSelection: function() {
      $("#credential_list li").removeClass("selected_item");
    },
    registerNewCredential: function() {
      $("button#save_credential").button("option", "disabled", false);
    },

    saveCredential: function() {
      if (this.selectedCloudCredential.id === "") {
        $("button.save_credential").button("option", "disabled", true);
        this.cloudCredentials.create(this.selectedCloudCredential, {
          cloud_account_id: this.selectedCloudAccount.id
        });
      } else {
        this.cloudCredentials.update(this.selectedCloudCredential);
      }

      //this.cloudCredentials.refresh();
    },

    deleteCredential: function() {
      if (this.selectedCloudCredential) {
        this.cloudCredentials.deleteCredential(this.selectedCloudCredential);
      }
    },

    notifyDeleted: function() {
      this.subViews[0].close();
      $("button#save_credential").hide();
      $("button#delete_credential").button("option", "disabled", true);
      this.cloudCredentials.fetch({
        reset: true
      });

    },

    notifySaved: function() {
      this.cloudCredentials.fetch({
        reset: true
      });
    },

    close: function() {
      this.$el.remove();
    }
  });

  return CloudCredentialManagementView;
});
