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
        'bootstrap',
        'backbone',
        'icanhaz',
        'common',
        'typeahead', // Not an AMD component!
        'text!templates/apps/appsTemplate.html',
        'collections/apps',
        'collections/cloudCredentials',
        'views/apps/appsListView',
        'models/app',
        'jquery-plugins',
        'jquery-ui-plugins'
], function( $, _, bootstrap, Backbone, ich, Common, typeahead, appsTemplate, Apps, CloudCredentials, AppsListView, App ) {
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
            "typeahead:selected": "packageClick"
        },

        initialize: function() {
            console.log("Initialize apps and plat.");
            var $this = this;

            require(['bootstrap'], function() {});

            if (!_.compile){
                _.compile = function(templ) {
                  var compiled = this.template(templ);
                  compiled.render = function(ctx) {
                     return this(ctx);
                  };
                  return compiled;
               };
            }
            
            this.subViews = [];
            $("#main").html(this.el);
            this.$el.html(this.template);
            $(function(){
                $("#configuration-management-library-source").typeahead({
                    name: "configManagmentLibrarySource",
                    prefetch: {
                        url: "samples/apps.json",
                        filter: function(parsedResponse){
                            return parsedResponse;
                        }
                    },
                    template: [
                        '<div class="packageItem">',
                            '<p class="packages cfg-icon cfg-icon-<%=tool%>"></p>',
                            '<p class="config-name"><%=value%></p>',
                            '<p class="config-tool"><%=tool%></p>',
                        '</div>'
                    ].join(''),
                    engine: _
                }).on('typeahead:opened', function() { //hack to overcome overflow inside an accordion.
                    $(this).closest('.accordion-body').css('overflow','visible');
                    console.log("typeahed:opened");
                }).on('typeahead:closed', function() {
                    $(this).closest('.accordion-body').css('overflow','hidden');
                    console.log("typeahed:closed");
                });
                
                console.log("Typeahead initialized.");
            });

            $this.listView = new AppsListView({el: $("#selected-apps-list") });
            $this.listView.render();
            $this.listView.on("lastAppRemoved", $this.disableDeployLaunch, $this);

            this.cloudCredentials = new CloudCredentials();
            this.cloudCredentials.on('reset', this.populateCredentials, this);

            $("#selectAccordion").on("shown", this.toggleInstInfra);
            var response = $.ajax({
                url: "samples/cloudDefinitions.json",
                async: false
            }).responseText;

            this.cloudDefinitions = $.parseJSON(response);

        },

        populateRegions: function(evt){
            var select = $("#select-region")
                .empty()
                .on("change", $.proxy(this.regionChanged, this));
            var optionSelected = $("option:selected", evt.target);
            var credential = optionSelected.data("cloudCredentials");
            var provider = this.cloudDefinitions[credential.get("cloud_provider").toLowerCase()];
            $.each(provider.regions, function(index, element){
                $('<option>')
                    .val(element.zone)
                    .text(element.name)
                    .data("region", element)
                    .data("credential", credential)
                    .appendTo(select);
             });
            this.regionChanged({target:select});

        },

        populateCredentials: function(list, options){
            var select = $("#select-credentials")
                .empty()
                .on("change", $.proxy(this.populateRegions, this));
            list.forEach(function(element, index, list){
                $('<option>')
                    //.val(element.get("id"))
                    .text(element.get("cloud_name") + ":" + element.get("name"))
                    .data("cloudCredentials", element)
                    .appendTo(select);
             });
            this.populateRegions(select);

        },

        regionChanged: function(evt){
            var optionSelected = $("option:selected", evt.target);
            var region = optionSelected.data("region");
            var credential = optionSelected.data("credential");
            this.populateInstances(region, credential);
        },

        populateInstances: function(region, credential){
            var $this = this;
            var providerName = credential.get("cloud_provider").toLowerCase();
            var appPath = "../" + providerName + "/collections/compute/" + providerName + "Instances";

            require([appPath], function (Instances) {
                var instances = new Instances();
                
                instances
                    .fetch({ 
                        data: {
                            cred_id: credential.id, 
                            region: region.zone
                        }
                    })
                    .done(function(model, response, options){
                        $this.renderInstances(model);
                });
            });
        },

        renderInstance: function(instanceContainer, instance){
            var tr = $("<tr></tr>");
            var checkTd = $("<td></td>").appendTo(tr);
            $("<input type='checkbox'></input>")
                .data("instance",instance)
                .appendTo(checkTd)
                .on("change", $.proxy(this.updateDeployButtonState, this));
            $("<td></td>").text(instance.tags.Name).appendTo(tr);
            $("<td></td>").text(instance.id).appendTo(tr);
            //$("<td></td>").text("").appendTo(tr);
            //$("<td></td>").text("").appendTo(tr);
            //$("<td></td>").text("").appendTo(tr);
            tr.appendTo(instanceContainer);
        },

        updateDeployButtonState: function(){
            var checked = $("#instance-container input[type='checkbox']:checked").length;
            var enabled = checked && this.listView.collection.length;
            if (enabled){
                $("#deploy-to")
                    .removeClass("disabled")
                    .prop("disabled", false);
            } else {
                $("#deploy-to")
                    .addClass("disabled")
                    .prop("disabled", true);
            }
        },

        renderInstances: function(instances){
            var $this = this;
            var instanceContainer = $("#instance-container");
            instanceContainer.empty();
            $.each(instances, function(index, item){
                $this.renderInstance(instanceContainer, item);
            });
            this.updateDeployButtonState();
        },

        renderAppSelector: function(){

        },

        loadCredentials: function(){
            this.cloudCredentials.fetch({
                reset: true
            });
        },

        disableDeployLaunch: function(){
            $("#deploy-launch").addClass("disabled");
            this.updateDeployButtonState();
        },

        enableDeployLaunch: function(){
            $("#deploy-launch").removeClass("disabled");
        },

        toggleInstInfra: function(ev){
            switch(ev.target.id)
            {
                case ("collapseConfig"):{
                    $("#deploy-inst").show();
                    $("#deploy-infra").hide();
                }break;
                case ("collapseInfra"):{
                    $("#deploy-inst").hide();
                    $("#deploy-infra").show();
                }break;
            }
        },

        render: function () {
            $("#main").removeClass("twelvecol last");
            $("#main>div").removeClass("twelvecol last");
            this.loadAppsApp();
            this.loadCredentials();
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

        packageClick: function(evt, package) {
            this.listView.addApp(package);
            this.enableDeployLaunch();
            this.updateDeployButtonState();
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
