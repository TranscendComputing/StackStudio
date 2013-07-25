/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true requirejs:true require:true alert:true*/
define([
        'jquery',
        'underscore',
        'backbone',
        'icanhaz',
        'common',
        'text!templates/apps/appsTemplate.html',
        'jquery-plugins',
        'jquery-ui-plugins'
], function( $, _, Backbone, ich, Common, appsTemplate ) {
	// The Apps & Platforms View
	// ------------------------------

    /**
     * AppsView is UI view of apps to be added.
     *
     * @name AppsView
     * @constructor
     * @category Apps
     * @param {Object} initialization object.
     * @returns {Object} Returns a AppsView project.
     */
	var AppsView = Backbone.View.extend({

		id: 'apps_view',

		className: ['twelvecol', 'last'],

		template: _.template(appsTemplate),

        cloudProvider: undefined,

		type: undefined,

		subtype:undefined,

		appsId: undefined,

        appsApp: undefined,

        events: {
            "click .nav a" : "navListClick",
            "click .pick-inst": "onChecked",
            "click #deploy-to": "deployTo",
            "click #deploy-launch": "deployLaunch"
		},

		initialize: function() {
		    console.log("Initialize apps and plat.");

		    require(['bootstrap'], function() {});

            this.subViews = [];
            $("#main").html(this.el);
            this.$el.html(this.template);
            var response = $.ajax({
                url: "samples/cloudDefinitions.json",
                async: false
            }).responseText;

            this.cloudDefinitions = $.parseJSON(response);

        },

        render: function () {
            console.log("render apps and plat.");
		    this.loadAppsApp();
		},

		loadAppsApp: function() {
        },

        navListClick: function(evt) {
            console.log("click apps and plat.", this, evt.target);
            $(evt.target).parent().parent().find(".source").removeClass("active");
            $(evt.target).parent().parent().find(".l2").hide();
            $(evt.target).parent().find(".l2").show();
            if ($(evt.target).parent().hasClass("active")) {
                $(evt.target).parent().removeClass("active");
                console.log("is active");
            } else {
                $(evt.target).parent().addClass("active");
            }
            return false;
        },

        onChecked: function(evt) {
            console.log("click check.", this, evt.target);
            $(".hero-unit").find(".btn").removeClass("disabled");
        },

        deployTo: function(evt) {
            var message = "Deploy selected modules to the selected instances.";
            console.log("deploy to.", this, evt.target);

            $("#msg").html(message);
            $(".alert").delay(200).addClass("in").show().fadeOut(4000);
        },

        deployLaunch: function(evt) {
            console.log("click check.", this, evt.target);
            $("#msg").html('Launch "Run Instance" dialog');
            $(".alert").delay(200).addClass("in").show().fadeOut(4000);
        },

        close: function(){
            this.$el.empty();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
        }
	});

	var appsView;

    Common.router.on('route:apps', function () {
        if (this.previousView !== appsView) {
            this.unloadPreviousState();
            appsView = new AppsView();
            this.setPreviousState(appsView);
        }
        appsView.render();

    }, Common);

	return AppsView;
});
