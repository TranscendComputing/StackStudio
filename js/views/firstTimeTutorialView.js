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
	'icanhaz',
	'common',
	'models/account',
	'text!templates/firstTimeTutorialTemplate.html',
	'models/tutorialState',
	'../instructor'
], function ( $, _, Backbone, icanhaz, common, Account, tutorialTemplate, TutorialState ) {
	var tooltipView = Backbone.View.extend({
		el: "#instructor",
		template: tutorialTemplate,
		steps: [],
		updateSteps : null,
		rootView : [],
		incremented: false,
		events : {
			"dialogClose" : "close"
		},

		initialize : function () {
			var self = this;
			self.rootView = self.options.rootView;
      if(parseInt(sessionStorage.num_logins, 10) < 20) {
				this.steps = [
					{
						title: 'Cloud Accounts',
						messageElement : $('#tutorialMessage'),
						message: 'You can set up a cloud account to manage it through StackStudio. Currently, StackStudio supports AWS, OpenStack, and Google cloud accounts.',
						tips: [
							{
								element: $('#mCloudAccount_tree #c_account_list>a'),
								message: 'Click here to add a cloud account',
								onClicked: this.initNextTip.bind(this, true, true)
							},
							{
								element: $('.account_list_page #create_group_button'),
								message: 'Now click here',
								onClicked: this.bindSubAppEvents.bind(this)
							}
						]
					},
					{
						title: 'Cloud Credentials',
						messageElement : $('#tutorialMessage'),
						message: 'Before you can manage your cloud account, you need to add your cloud credentials. Click the link indicated above to view your saved credentials as well as add new ones.',
						tips: [
							{
								element: $('#mCloudCredential_tree #cred_list>a'),
								message: 'Click here to add cloud credentials',
								onClicked: this.initNextTip.bind(this, true, true)
							},
							{
								element: $('.credential_list_page #create_group_button'),
								message: 'Now click here',
								onClicked: this.bindSubAppEvents.bind(this)
							}
						]
					},
					{
						title: 'Policies',
						messageElement : $('#tutorialMessage'),
						message: 'Policies allow you to alter the security features of your cloud server. To create a policy, click the indictated link above and then click "Create Policy".',
						tips: [
							{
								element: $('#mPolicy_tree #policy_list>a'),
								message: 'Click here to add a policy',
								onClicked: this.initNextTip.bind(this, true, true)
							},
							{
								element: $('.policies_list_page #create_user_button'),
								message: 'Now click here',
								onClicked: this.bindSubAppEvents.bind(this)
							}
						]
					},
					{
						title: 'Configuration Managers',
						messageElement : $('#tutorialMessage'),
						message: 'Configuration managers ease the process of managing scaling, deployment, and general configuration of your cloud server. StackStudio currently supports Chef, Puppet, Salt, and Ansible. If you have one of these accounts, you can link it by clicking the indicated link above.',
						tips: [
							{
								element: $('#mdevOps_tree #devops_list>a'),
								message: 'Click here to add a configuration manager',
								onClicked: this.initNextTip.bind(this, true, true)
							},
							{
								element : $('#new_config_manager'),
								message: 'Now click here',
								onClicked: this.bindSubAppEvents.bind(this)
							}
						]
					},
					{
						title: 'Continuous Integration',
						messageElement : $('#tutorialMessage'),
						message: 'Continuous integration servers help manage scheduled builds, deployments, source control, and more. Click the link above view/manage your continuous integration server(s).',
						tips: [
							{
								element: $('#mContinuousIntegration_tree #ci_list>a'),
								message: 'Click here to set up a continuous integration server',
								onClicked: this.initNextTip.bind(this, true, true)
							},
							{
								element: $('#new_ci_server'),
								message: 'Now click here',
								onClicked: this.bindSubAppEvents.bind(this)
							}
						]
					}
				];
			}
		},

		render: function () {
			var self = this;
			if(!icanhaz.tutorial_view) {
				icanhaz.addTemplate("tutorial_view", this.template);
			}

			$.each(icanhaz.tutorial_view(), function ( index, el ) {
				self.$el.append(el.outerHTML);
			});

			var ts = new TutorialState();
			ts.get(sessionStorage.account_id, function ( state ) {
				var $instructor = $('#instructor');

				if(state) {
					state.progress = state.progress.map(function ( step ) {
						return step[1];
					});
				}

				$instructor.instructor({
					fromExisting : state,
					steps: self.steps,
					onStepSelect: function ( step ) {
						self.initNextTip(false, false);
					},
					onClose : function ( tutorial ) {
						$('#instructor').hide();
					},
					onProgressChange : function ( tutorialState ) {
						var tutState = _.extend(tutorialState, {
							account_id: sessionStorage.account_id
						});

						ts.save(tutState);
					},
					afterRender : function () {
						$('.instructor-step-label').addClass('col-lg-6')
																			 .addClass('col-md-6')
																			 .addClass('col-sm-12');
						$('#wrapper').css('margin-bottom', $('#instructor').height() * 1.5);
					},
					afterTipRender : function ( tip ) {
						$('html, body').animate({ scrollTop: tip.triggerElement.offset().top - 200 }, 'slow');
					}
				});


				setTimeout(function () {
					$instructor.instructor('showTip');
				}, 500);
			});
		},

		initNextTip : function ( increment, isDeferred ) {
			var self = this;
			if(increment) {
				if(!this.incremented) {
					$('#instructor').instructor('nextTip', !isDeferred);
					this.incremented = true;
				}
			}
			
			if(isDeferred) {
				this.updateSteps = function () {
					$('#instructor').instructor('showTip');
					self.incremented = false;
				};
			} else {
				$('#instructor').instructor('showTip');
			}
		},

		bindSubAppEvents: function () {
			var self = this;
			var afterRender = self.rootView.afterSubAppRender;
			self.rootView.afterSubAppRender = function ( subApp ) {
				if(subApp) {
					subApp.onCreated = function () {
						self.initNextTip(true, true);
						self.update();
					};
				}
				self.rootView.afterSubAppRender = afterRender;
			};
		},

		update: function () {
			if(this.updateSteps) {
				this.updateSteps();
				this.updateSteps = null;
			}
		}
	});

	return tooltipView;
});