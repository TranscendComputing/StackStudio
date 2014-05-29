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
], function( $, _, Backbone, Common, setupTemplate, CloudAccounts, CloudCredentials,
             Policies, Users, Groups, CloudAccountManagementView, CloudCredentialManagementView,
             CloudCredentialManagementListView, CloudAccountManagementListView,
             UsersManagementView, UserUpdateView, PoliciesManagementView, PolicyManagementView,
             GroupsManagementView, GroupsManagementListView, DevOpsToolsManagementView,
             ContinuousIntegrationManagementView, SourceControlRepositoryManagementListView,
             TutorialView ) {
    var CloudSetupView = Backbone.View.extend({
        /** @type {String} DOM element to attach view to */
        el: "#main",
        /** @type {Template} HTML template to generate view from */
        template: _.template(setupTemplate),
        /** @type {Object} Object of events for view to listen on */
        events: {
            "click #treeAddUser": "addUser",
            "click #cloud_setup_menu>li" : "tabSelected",
            "click #cloud_setup_menu ul a" : "itemSelected"
        },
        subApp: undefined,
        groups: undefined,
        cloudCredentials: undefined,
        cloudAccounts: undefined,
        policies: undefined,
        afterSubAppRender: undefined,
        initialize: function() {
            var self = this;
            this.render();

            this.cloudAccounts = new CloudAccounts();

            //todo -- Cache these or something so we don't waste the calls -- they're really just for the badges
            this.cloudAccounts.fetch({
                data: $.param({ org_id: sessionStorage.org_id, account_id: sessionStorage.account_id}),
                success: this.onFetched('#cloud_account_list'),
                reset : true
            });

            this.policies = new Policies();
            this.policies.fetch({
                data: $.param({ org_id: sessionStorage.org_id }),
                success : this.onFetched('#policy_list'),
                reset : true
            });

            this.users = new Users();
            this.users.fetch({
                success : this.onFetched('#user_list'),
                reset : true
            });

            this.groups = new Groups();
            this.groups.fetch({
                success : this.onFetched('#group_list'),
                reset : true
            });

            if(sessionStorage && parseInt(sessionStorage.num_logins, 10) < 5)  {
                this.tutorial = new TutorialView({ rootView: this });

                this.afterSubAppRender = function () {
                    self.tutorial.update();
                };
            }
        },

        render: function () {
            this.$el.html(this.template);

            if(this.tutorial) {
                this.tutorial.render();
            }

            //cloud credentials stored in session
            $('#cred_list').parent().find('.badge').text(JSON.parse(sessionStorage.cloud_credentials).length);
        },

        onFetched : function ( list ) {
            var self = this;
            return function ( coll ) {
                self.addAll(coll, $(list));
            };
        },

        tabSelected : function ( event ) {
            var $target = $(event.target);
            
            if($target.hasClass('cloud-submenu-item')) {
                return;
            }

            var $el = $(event.currentTarget);
            //if it isn't expanded, expand it
            if(!$el.hasClass('open')) {
                $el.addClass('open');
            } else {
                //only close it if the tab is already active -- prevents closing when switching to an already open tab
                if($el.hasClass('active')) {
                    $el.removeClass('open');
                }
            }

            $('.sub-active', '#cloud_setup_menu').removeClass('sub-active');
            $('.active', '#cloud_setup_menu').removeClass('active');
            $el.addClass('active');
        },

        addAll : function ( collection, $list ) {
            $list.empty();
            collection.each(function ( model ) {
                var id = model.attributes.id;
                var classes = 'cloud-submenu-item '+$list.attr('data-collection-name');
                var href = $list.attr('data-base-url');
                var text = (model.attributes.name || model.attributes.login);

                //console.info('ID: '+id+', Classes: '+classes+'. HREF: '+href+', Text: '+text);
                $list.append(
                    '<li>'+
                    '<a id="'+id+'" class="'+classes+'" href="'+href+'">'+
                    text+'</a></li>'
                );
            });

            $list.parent().find('.badge').text(collection.length);
        },

        itemSelected : function ( event ) {
            var $el = $(event.currentTarget);
            var $list = $el.parents('[data-collection-name]');
            this.selectedId = event.target.id;
            this.selectedCollection = this[$list.attr('data-collection-name')];

            var route = $list.attr('data-base-url');

            //if there is no route change, we need to trigger the route handler manually
            if(location.hash === route) {
                Backbone.history.loadUrl(Backbone.history.fragment);
            }

            $('.active', '#cloud_setup_menu').removeClass('active');
            $('.sub-active', '#cloud_setup_menu').removeClass('sub-active');
            $el.parents().eq(2).addClass('active');
            $el.addClass('sub-active');
        },
        close: function(){
            this.$el.empty();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            // handle other unbinding needs here
            _.each(this.subViews, function ( childView ) {
              if (childView.close){
                childView.close();
              }
            });
        }
    });

    /** Variable to track whether view has been initialized or not */
    var cloudSetupView;
    var self = this;
    Common.router.on("route:cloudSetup", function ( action ) {
        // Make sure action always has a value, if not default to /
        action = action || '/';

        // Only load cloudSetupView if not already loaded or root action requested
        if (this.previousView !== cloudSetupView || action === '/') {
            this.unloadPreviousState();
            cloudSetupView = new CloudSetupView();
            this.setPreviousState(cloudSetupView);
        }

        // Create params object for subApp instantiation below
        var params = {
            rootView : cloudSetupView,
            selectedId : cloudSetupView.selectedId,
            collection : cloudSetupView.selectedCollection
        };

        // category is used below in jQuery styling. if category is false 
        // (NaN, undefined, false) or is blank, default to cloud-accounts
        var category = action.replace('/','').split("_list")[0];
        if (!category || category === '') {
            category = 'cloud-accounts';
        }

        // HashMap for mapping actions to proper subApp view
        var viewAssociations = {
            "user_list" : UsersManagementView,
            "policy_list" : PoliciesManagementView,
            "group_list" : GroupsManagementListView,
            "cloud-credentials_list" : CloudCredentialManagementListView,
            "cloud-accounts_list" : CloudAccountManagementListView,
            "cloud-accounts" : CloudAccountManagementView,
            "cloud-credentials" : CloudCredentialManagementView,
            "user" : UserUpdateView,
            "policy" : PolicyManagementView,
            "group" : GroupsManagementView,
            "configuration_managers_list" : DevOpsToolsManagementView,
            "continuous_integration_list" : ContinuousIntegrationManagementView,
            "source_control_repositories_list" : SourceControlRepositoryManagementListView,
            "home" : CloudAccountManagementListView,
            "/": CloudAccountManagementListView
        };

        // Set SubView based on action as key in hash map above
        var SubView = viewAssociations[action] || CloudAccountManagementListView;

        // Close/clear previous loaded subApp if defined/loaded
        if (cloudSetupView.subApp) {
            cloudSetupView.subApp.close();

            // Handle special case of user menu item by loading the
            // UsersManagementView in background before showing edit dialig
            if (action === 'user') {
                cloudSetupView.subApp = new UsersManagementView(params);
            }
        }

        // Instantiate subApp view object
        cloudSetupView.subApp = new SubView(params);

        // Reset attributes to avoid "bleed over"
        cloudSetupView.selectedId = undefined;
        cloudSetupView.selectedCollection = undefined;

        if (cloudSetupView.afterSubAppRender) {
            cloudSetupView.afterSubAppRender.call(cloudSetupView);
        }
    }, Common);

    return CloudSetupView;
});
