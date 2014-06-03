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
  'text!templates/cloud_setup/cloudSetupTemplate.html',
  'collections/cloudAccounts',
  'collections/cloudCredentials',
  'collections/policies',
  'collections/users',
  'collections/groups',
  'views/account/cloudAccountManagementView',
  'views/account/cloudCredentialManagementView',
  'views/account/cloudCredentialManagementListView',
  'views/account/cloudAccountManagementListView',
  'views/account/usersManagementView',
  'views/account/userUpdateView',
  'views/account/policiesManagementView',
  'views/account/policyManagementView',
  'views/account/groupsManagementView',
  'views/account/groupsManagementListView',
  'views/account/devOpsToolsManagementView',
  'views/account/continuousIntegrationManagementView',
  'views/account/sourceControlRepositoryManagementListView',
  'views/firstTimeTutorialView',
  'jquery-plugins',
  'jquery-ui-plugins',
  'jquery.jstree'
], function($, _, Backbone, Common, setupTemplate, CloudAccounts, CloudCredentials,
  Policies, Users, Groups, CloudAccountManagementView, CloudCredentialManagementView,
  CloudCredentialManagementListView, CloudAccountManagementListView,
  UsersManagementView, UserUpdateView, PoliciesManagementView, PolicyManagementView,
  GroupsManagementView, GroupsManagementListView, DevOpsToolsManagementView,
  ContinuousIntegrationManagementView, SourceControlRepositoryManagementListView,
  TutorialView) {
  var CloudSetupView = Backbone.View.extend({
    /** @type {String} DOM element to attach view to */
    el: "#main",
    /** @type {Template} HTML template to generate view from */
    template: _.template(setupTemplate),
    /** @type {Object} Object of events for view to listen on */
    events: {
      "click #treeAddUser": "addUser",
      "click #cloud_setup_menu>li": "tabSelected",
      "click #cloud_setup_menu ul a": "itemSelected"
    },
    subApp: undefined,
    groups: undefined,
    cloudCredentials: undefined,
    cloudAccounts: undefined,
    policies: undefined,
    afterSubAppRender: undefined,
    initialize: function() {
      var self = this;

      this.cloudAccounts = new CloudAccounts();

      //todo -- Cache these or something so we don't waste the calls -- they're really just for the badges
      this.cloudAccounts.fetch({
        data: $.param({
          org_id: Common.account.org_id,
          account_id: Common.account.id
        }),
        success: this.onFetched('#cloud_account_list'),
        reset: true
      });

      this.credentials = new CloudCredentials();
      this.credentials.reset(Common.credentials);

      this.policies = new Policies();
      this.policies.fetch({
        data: $.param({
          org_id: Common.account.org_id
        }),
        success: this.onFetched('#policy_list'),
        reset: true
      });

      this.users = new Users();
      this.users.fetch({
        success: this.onFetched('#user_list'),
        reset: true
      });

      this.groups = new Groups();
      this.groups.fetch({
        success: this.onFetched('#group_list'),
        reset: true
      });

      this.render();

      if (Common.account && parseInt(Common.account.num_logins, 10) < 5) {
        this.tutorial = new TutorialView({
          rootView: this
        });

        this.afterSubAppRender = function() {
          self.tutorial.update();
        };
      }
    },

    render: function() {
      this.$el.html(this.template);

      if (this.tutorial) {
        this.tutorial.render();
      }

      //cloud credentials stored in session
      $('#cred_list').parent().find('.badge').text(Common.credentials.length);
    },

    onFetched: function(list) {
      var self = this;
      return function(coll) {
        self.addAll(coll, $(list));
      };
    },

    tabSelected: function(event) {
      var $target = $(event.target);

      if ($target.hasClass('cloud-submenu-item')) {
        return;
      }

      var $el = $(event.currentTarget);
      //if it isn't expanded, expand it
      if (!$el.hasClass('open')) {
        $el.addClass('open');
      } else {
        //only close it if the tab is already active -- prevents closing when switching to an already open tab
        if ($el.hasClass('active')) {
          $el.removeClass('open');
        }
      }
    },

    addAll: function(collection, $list) {
      $list.empty();
      collection.each(function(model) {
        $list.append('<li><a id="' + model.attributes.id + '" class="cloud-submenu-item ' + $list.attr('data-collection-name') + '" href="' + $list.attr('data-base-url') + '">' + (model.attributes.name || model.attributes.login) + '</a></li>');
      });
      $list.parent().find('.badge').text(collection.length);
    },

    itemSelected: function(event) {
      var id = event.target.id;
      var $list = $(event.currentTarget).parents('[data-collection-name]');
      var collectionName = $list.attr('data-collection-name');
      this.selectedId = id;
      this.selectedCollection = this[collectionName];

      var route = $list.attr('data-base-url');

      //if there is no route change, we need to trigger the route handler manually
      if (location.hash === route) {
        Backbone.history.loadUrl(Backbone.history.fragment);
      }
    },
    close: function() {
      this.$el.empty();
      this.undelegateEvents();
      this.stopListening();
      this.unbind();
      // handle other unbinding needs here
      _.each(this.subViews, function(childView) {
        if (childView.close) {
          childView.close();
        }
      });
    }
  });

  /** Variable to track whether view has been initialized or not */
  var cloudSetupView;
  var self = this;
  Common.router.on("route:cloudSetup", function ( action, id ) {

    if (!Common.authenticate({ redirect: 'here' })) {
      return;
    }

    if (!action || action === "/") {
      Common.router.navigate("#cloud/setup/cloud-accounts_list", {
        trigger: true
      });
      return;
    }

    var category = action.replace('/', '').split("_list")[0];

    $('#cloud_setup_menu>li.active').removeClass('active');
    $('.sub-active').removeClass('sub-active');
    $('[data-group="' + category + '"]').addClass('active');

    if (this.previousView !== cloudSetupView) {
      this.unloadPreviousState();
      cloudSetupView = new CloudSetupView();
      this.setPreviousState(cloudSetupView);
    }

    var viewAssociations = {
      "user_list": UsersManagementView,
      "policy_list": PoliciesManagementView,
      "group_list": GroupsManagementListView,
      "cloud-credentials_list": CloudCredentialManagementListView,
      "cloud-accounts_list": CloudAccountManagementListView,
      "cloud-accounts": CloudAccountManagementView,
      "cloud-credentials": CloudCredentialManagementView,
      "user": UserUpdateView,
      "policy": PolicyManagementView,
      "group": GroupsManagementView,
      "configuration_managers_list": DevOpsToolsManagementView,
      "continuous_integration_list": ContinuousIntegrationManagementView,
      "source_control_repositories_list": SourceControlRepositoryManagementListView,
      "home": CloudAccountManagementListView
    };

    // Set SubView based on action as key in hash map above
    var SubView = viewAssociations[action] || CloudAccountManagementView;

    if (cloudSetupView.subApp) {
      cloudSetupView.subApp.close();
    }

    if (action.indexOf('list') === -1) {

      //if there is an id in the url
      if(id) {
        cloudSetupView.selectedId = id;
        var collectionName = $('#' + id)
                              .parents('[data-collection-name]')
                              .attr('data-collection-name');
        cloudSetupView.selectedCollection = cloudSetupView[collectionName];
      } else { //otherwise, navigate to list view
        if (!(cloudSetupView.selectedId && cloudSetupView.selectedCollection)) {
          Common.router.navigate('#cloud/setup/' + action + '_list', {
            trigger: true
          });
          return;
        }
      }

    }

    var params = {
      rootView: cloudSetupView
    };

    if (cloudSetupView.selectedId) {
      params.selectedId = cloudSetupView.selectedId;
      params.collection = cloudSetupView.selectedCollection;
    }

    cloudSetupView.subApp = new SubView(params);

    if (cloudSetupView.selectedId) {
      $('#' + cloudSetupView.selectedId).addClass('sub-active');
    }
    cloudSetupView.selectedId = undefined;
    cloudSetupView.selectedCollection = undefined;

    if (cloudSetupView.afterSubAppRender) {
      cloudSetupView.afterSubAppRender.call(cloudSetupView);
    }
  }, Common);

  return CloudSetupView;
});
