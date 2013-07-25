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

        appsApp: undefined,

        events: {
            "click .nav a" : "navListClick",
            "click a.source-search" : "searchClick",
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
            this.loadAppsApp();
        },

        loadAppsApp: function() {
        },

        searchClick: function(evt) {
            var label, clicked;
            clicked = $(evt.target);
            $("#msg").html('Perform typeahead search, in case of long list of items.');
            $(".alert").delay(200).addClass("in").show().fadeOut(4000);
            return false;
        },

        navListClick: function(evt) {
            var label, clicked;
            clicked = $(evt.target);
            if (clicked.hasClass("source-search")) {
                return;
            }
            if (clicked.hasClass("source")) {
                clicked.parent().parent().find(".source").removeClass("active");
                clicked.parent().parent().find(".l2").hide();
                clicked.parent().find(".l2").show();
            } else {
                label = clicked.text();
                if (clicked.parent().hasClass("active")) {
                    clicked.parent().removeClass("active");
                    $(".selected-apps").children().each(function(i, e) {
                        if (e.innerHTML === label) {
                            e.remove();
                        }
                    });
                    if ($(".selected-apps").children().length === 0) {
                        $(".selected-apps").html("No apps selected.");
                        $(".hero-unit").find(".btn").addClass("disabled");
                    }
                } else {
                    if ($(".selected-apps").children().length === 0) {
                        $(".selected-apps").html("");
                        $("#deploy-launch").removeClass("disabled");
                    }
                    clicked.parent().addClass("active");
                    $(".selected-apps").append('<button class="btn">'+label+'</button>');
                    this.onChecked(null);
                }
            }
            return false;
        },

        onChecked: function(evt) {
            if ($(".selected-apps").children().length > 0) {
                if ($("input:checked").length > 0) {
                    $(".hero-unit").find(".btn").removeClass("disabled");
                }
            }
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
