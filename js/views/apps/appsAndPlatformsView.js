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

        //className: [''],

        template: _.template(appsTemplate),

        cloudProvider: undefined,

        appsApp: undefined,

        events: {
            "click a.source" : "packageSourceClick",
            "click .packages a" : "packageClick",
            "click a.infra-source" : "infraSourceClick",
            "click .infra-packages a" : "infraClick",
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
            $("#main").removeClass("twelvecol last");
            $("#main>div").removeClass("twelvecol last");
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

        packageSourceClick: function(evt) {
            var label, clicked;
            $("#deploy-infra").hide();
            $("#deploy-inst").show();
            clicked = $(evt.target);
            clicked.parent().parent().find(".source").removeClass("active");
            clicked.parent().parent().find(".l2").hide();
            clicked.parent().find(".l2").show();
            return false;
        },

        packageClick: function(evt) {
            var label, clicked;
            $("#deploy-infra").hide();
            $("#deploy-inst").show();
            clicked = $(evt.target);
            if (clicked.hasClass("source-search")) {
                return;
            }
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
            return false;
        },

        infraSourceClick: function(evt) {
            var label, clicked;
            $("#deploy-infra").show();
            $("#deploy-inst").hide();
            clicked = $(evt.target);
            clicked.parent().parent().find(".infra-source").removeClass("active");
            clicked.parent().parent().find(".l2").hide();
            clicked.parent().find(".l2").show();
            return false;
        },


        infraClick: function(evt) {
            var label, clicked;
            $("#deploy-infra").show();
            $("#deploy-inst").hide();
            clicked = $(evt.target);
            if (clicked.hasClass("source-search")) {
                return;
            }
            label = clicked.text();
            if (clicked.parent().hasClass("active")) {
                clicked.parent().removeClass("active");
                $(".selected-infra").children().each(function(i, e) {
                    if (e.innerHTML === label) {
                        e.remove();
                    }
                });
                if ($(".selected-infra").children().length === 0) {
                    $(".selected-infra").html("No apps selected.");
                    $("#deploy-infra").find(".btn").addClass("disabled");
                }
            } else {
                if ($(".selected-infra").children().length === 0) {
                    $(".selected-infra").html("");
                    $("#launch").removeClass("disabled");
                }
                clicked.parent().addClass("active");
                $(".selected-infra").append('<button class="btn">'+label+'</button>');
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
