/*
TODO LIST:
- Add Enable/Disable for infra checkboxes
- Need a way to determine whether chef, puppet, or cloudFormation are configured before displaying
- Wire up deployment buttons (when services available)

- Add mechanism for ordering chef run-list

*/


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
        'text!templates/assemblies/configTreeTemplate.html',
        'collections/apps',
        'collections/cloudCredentials',
        'collections/cookbooks',
        'collections/chefEnvironments',
        'collections/puppetClasses',
        'views/assemblies/appListView',
        'models/app',
        'jquery-plugins',
        'jquery-ui-plugins',
        'jquery.dataTables',
        'jquery.dataTables.fnProcessingIndicator',
        'jquery.sortable'
],function( $, _, bootstrap, Backbone, ich, Common, typeahead, appsTemplate, Apps, CloudCredentials, Cookbooks, ChefEnvironments, PuppetClasses, AppListView, App ) {

    var ConfigListView = Backbone.View.extend({
        id: 'config_list',

        //className: [''],

        template: _.template(appsTemplate),

        cloudProvider: undefined,

        appsApp: undefined,

        subViews: [],

        events: {
            "typeahead:selected": "packageClick",
            "shown": "accordionShown",
            "change .recipes input": "recipeChangeHandler",
            "change .puppetClasses input": "classChangeHandler",
            "change #chef-selection .accordion-heading": "chefGroupChangeHandler",
            "change #puppet-selection .accordion-heading" : "puppetGroupChangeHandler"
        },
        initialize: function(){
        },

        render: function () {
            $("#assemblyLeftNav").empty();
            $("#assemblyLeftNav").html(this.el);
            this.$el.html(this.template);

            
        },
        environmentSelectHandler: function(evt){
            var $this = this;
            this.populateCookbooks(this.credential).done(function(){
                $this.recalculateChefBadges();
            });
        },
        chefGroupChangeHandler: function(evt){
            this.chefGroupQueue++;
            var ver = null;
            var checkbox = $(evt.target);
            if (!checkbox){
                return;
            }
            var level = checkbox.data("level");
            if (checkbox.prop("checked")){
                switch(level){
                     case "cookbook": {
                        ver = checkbox.closest(".accordion-group")
                            .find(".accordion-inner:first");
                        if (ver.data("isLoaded")){
                            ver.find("input[type='checkbox']:gt(0)").prop("checked", false).prop("disabled", true);
                            ver.find("input[type='checkbox']:eq(0)").prop("checked", true).prop("disabled", true);
                        } else {
                            var book = checkbox.closest(".accordion-group").data("cookbook");
                            var name = book.get("name");
                            var item = {name: name, description: "Loading..."}; //TODO: retrieve
                            var ul = $("<ul class='recipes'></ul>");
                            $("<li></li>")
                                .data("recipe", item)
                                .data("cookbook", book)
                                .data("isRecipe", true)
                                .append("<input type='checkbox' class='recipeSelector' checked='true' />")
                                .append("<span class='recipe'>" + item.name + "</span>" + "<span class='recipeDescription'>" + item.description + "</span>")
                                .appendTo(ul);
                            ver.empty().append(ul);
                        }
                    } break;
                    default: {
                        console.error("Unknown checkbox level: " + level);
                    }
                }
           
            } else {
                switch(level){
                    case "cookbook": {
                        checkbox.closest(".accordion-group")
                            .find(".accordion-inner:first").siblings().each(function(){
                                $(this).find(".accordion-inner:has(ul)").empty();
                            });
                        ver = checkbox.closest(".accordion-group")
                            .find(".accordion-inner:first");
                        if (ver.data("isLoaded")){
                            ver.find("input[type='checkbox']:gt(0)").prop("checked", false).prop("disabled", false);
                            ver.find("input[type='checkbox']:eq(0)").prop("checked", false).prop("disabled", false);
                        } else {
                            ver.empty();
                        }
                    } break;
                    default: {
                        console.error("Unknown checkbox level: " + level);
                    }
                }
            }
            this.chefGroupQueue--;
            if (!this.chefGroupQueue){
               this.recalculateChefBadges();
            }
        },

        puppetGroupChangeHandler: function(evt) {
            var checkbox = $(evt.target);
            var ver = checkbox.closest(".accordion-group")
                .find(".accordion-inner:first");
            ver.find(".classSelector").first().click();
        },
        fetchChefEnvironments: function(){
            var chefEnvironments = new ChefEnvironments();

            return chefEnvironments.fetch({
                data: {
                    account_id: this.credential.get("cloud_account_id")
                }
            });
        },
        populateChefEnvironments: function(list){
            var select = $("#chefEnvironmentSelect").empty();
            list.forEach(function(element, indexlist){
                var option = $("<option value='" + element.get("name") + "'>" + element.get("name") + "</option></select>").appendTo(select);
            });
            if(select.find("option[value=_default]").length > 0){
                select.val("_default").change();
            }else{
                var first = select.find("option").first();
                select.val(first.val()).change();
            }
            Common.vent.trigger("chefEnvironmentsPopulated");
        },
        populateCookbooks: function(credential){
            var cookbooks= new Cookbooks();
            return cookbooks.fetch({
                data: {
                    account_id: credential.get("cloud_account_id")
                },
                success: $.proxy(this.renderCookbooks, this)
            });
        },
        renderCookbooks: function(cookbooks){
            cookbooks.sort();
            var $this = this;
            var cb = $("#chef-selection");
            cb.empty();
            cookbooks.each(function(item){
                var elem = $($this.renderChefGroup("chef-selection", item.get("name"), item.get("latest_version")))
                    .data("cookbook", item);
                elem.find(".accordion-heading")
                    .prepend(
                        $("<input type='checkbox' class='cookbookSelector'>").data("level", "cookbook")
                    );
                elem.appendTo(cb); //TODO: if this doesn't perform well, try appending to a list first, then adding to doc. 
            });
            Common.vent.trigger("cookbooksLoaded");
        },

        renderModules: function(classes) {
            var modules = classes.toJSON();
            var $this = this;
            var moduleList = $("#puppet-selection");
            moduleList.empty();
            for (var module in modules) {
                if (modules.hasOwnProperty(module)) {
                    var elem = $($this.renderPuppetGroup("puppet-selection", module))
                        .data("module", classes.get(module).toJSON());
                    elem.find(".accordion-heading")
                        .prepend(
                            $("<input type='checkbox' class='moduleSelector'>").data("level", "module")
                    );
                    elem.appendTo(moduleList);
                    var recipeList = this.renderPuppetClasses(modules[module], []);
                    $("#" + module +"-module").find(".accordion-inner").empty().append(recipeList);
                }
            }
            this.recalculatePuppetBadges();
            Common.vent.trigger("modulesLoaded");
        },
        sortRecipes: function(recipes){
            var sorted = [];
            $.each(recipes, function( index, recipe ){
                sorted.push({name: recipe.name, description:recipe.description});
            });
            sorted.sort(function(a,b){
                if (a.name < b.name) {
                    return -1;
                } else if (a.name > b.name) {
                    return 1;
                }
                return 0;

            });
            return sorted;
        },

        populateRecipes: function(destination, book, recipes) {
            var sorted = this.sortRecipes(recipes);
            var selected = [];

            $(destination).find("input[type=checkbox]").each(function(index, checkbox) {
                if (checkbox.checked) {
                    selected.push($(checkbox).parent().find(".recipe").text());
                }
            });
            destination.empty()
                .data("isLoaded", true);
            var ul = this.renderRecipes(sorted, book, selected);
            ul.appendTo(destination);
        },

        renderRecipes: function(recipes, book, selected ){
            var ul = $("<ul class='recipes'></ul>");
            $.each(recipes, function( index, item ) {
                var checkedState = (selected.indexOf(item.name) !== -1) ? "checked='true'": "";
                var desc = item.description  ? item.description:"";
                $("<li></li>")
                    .data("recipe", item)
                    .data("cookbook", book)
                    .data("isRecipe", true)
                    .append("<input type='checkbox' " + checkedState + " class='recipeSelector'" + " />")
                    .append("<span class='recipe'>" + item.name + "</span>" + "<span class='recipeDescription'>" + desc + "</span>")
                    .appendTo(ul);
            });
            return ul;
        },
        renderPuppetClasses: function(classes, selected ){
            var ul = $("<ul class='puppetClasses'></ul>");
            $.each(classes, function( index, item ) {
                var checkedState = (selected.indexOf(item) !== -1) ? "checked='true'": "";
                $("<li></li>")
                    .data("class", item)
                    .data("isClass", true)
                    .append("<input type='checkbox' " + checkedState + " class='classSelector'" + " />")
                    .append("<span class='puppetClass'>" + item.name + "</span>")
                    .appendTo(ul);
            });
            return ul;
        },
        accordionGroupTemplate: ['<div class="accordion-group">',
                '<div class="accordion-heading">',
                  '<a class="accordion-toggle" data-toggle="collapse" data-parent="#{{accordionId}}" href="#{{collapseId}}">{{name}}<span class="badge badge-info pull-right"></span></a>',
                '</div>',
                '<div id="{{collapseId}}" class="accordion-body collapse">',
                  '<div class="accordion-inner">',
                  '</div>',
                '</div>',
            '</div>']
            .join(''),

        renderChefGroup: function(accordionId, name, version){ //TODO: make this a common function
            var title= name + " [" + version + "]";
            var elem = this.accordionGroupTemplate
                .split("{{name}}").join(title)
                .split("{{collapseId}}").join(name + "-cookbook")
                .split("{{accordionId}}").join(accordionId);
            return elem;
        },
        renderPuppetGroup: function(id, name){
            var elem = this.accordionGroupTemplate
                .split("{{name}}").join(name)
                .split("{{collapseId}}").join(name + "-module")
                .split("{{accordionId}}").join(id);
            return elem;
        },

        accordionShown: function(evt) {
            var $this = this;
            var data = $(evt.target).closest(".accordion-group").data();
            var $destination = $(evt.target).find(".accordion-inner").first();
            var isLoaded = $destination.data("isLoaded");

            var id = $(evt.target).get(0).id;
            if (isLoaded && id !== "collapsePuppet") {
                return;
            }
            if (data.hasOwnProperty("cookbook")) {
                var $book = data.cookbook;
                if (!$book) {
                    return;
                }
                var version = $book.get("latest_version");
                $("<i class='icon-spinner'></i>").appendTo($destination);
                $this.fetchRecipes($book, version)
                    .done(function(recipes) {
                        $this.populateRecipes.call($this, $destination, $book, recipes);
                    });
            } else if (id === "collapseChef") {
                $("#puppet-selection").closest(".accordion-group").find(".accordion-toggle:first span.badge:first").text('');
                $this.recalculateChefBadges();
            } else if (id === "collapsePuppet") {
                if(!$destination.data("isLoaded")){
                    $this.populatePuppetClasses();
                }else{
                    $this.recalculatePuppetBadges();
                }
                $("#chef-selection").closest(".accordion-group").find(".accordion-toggle:first span.badge:first").text('');
                //TODO: Clear Chef
            } //else: CLEAR PUPPET when cliick on chef
        },
        populatePuppetClasses:function (){
            var $this = this;
            var destination = $("#collapsePuppet").find(".accordion-inner");
            var accountId = this.credential.get("cloud_account_id");
            $this.puppetClasses = new PuppetClasses();
            $this.puppetClasses.fetch({
                data: $.param({
                    account_id: accountId
                }),
                success: function(collection, response, data) {
                    $this.renderModules(collection);
                    $this.recalculatePuppetBadges();
                    destination.data("isLoaded","true");
                },
                error: function(collection, response, data) {
                    Common.errorDialog("Server error", "Could not fetch Puppet classes/modules");
                }
            });
        },
        fetchRecipes: function(cookbook, version){
            var d = $.Deferred();
            var $this = this;
             $.ajax({
                url: [
                        Common.apiUrl,
                        "/stackstudio/v1/orchestration/chef/cookbooks/",
                        encodeURIComponent(cookbook.get("name")),
                        '/',
                        encodeURIComponent(version)
                    ].join(''),
                data: { account_id: this.credential.get("cloud_account_id")}
            }).done(function(model){
                d.resolve(model);
            }).fail(function(){
                $this.flashError("We're sorry.  Recipes could not be retrieved.");
                d.reject();
            });
            return d.promise();
        },
        
        recipeChangeHandler: function(evt){
            this.recalculateChefBadges();
        },
        classChangeHandler: function(evt){
            this.recalculatePuppetBadges();
        },

        recalculateChefBadges: function(){
            var badgeCount = 0;
            var chefContainer = $("#chef-selection");
            var allChecked = chefContainer.find("input[type='checkbox']:checked")
                .filter(function(){
                    return !$(this).parent().hasClass("accordion-heading");
                });
            chefContainer.closest(".accordion-group").find(".accordion-toggle:first span.badge:first").text(allChecked.length ? allChecked.length : '');

            badgeCount = allChecked.length;

            var cookbooks = $("#chef-selection>.accordion-group");
            cookbooks.each(function(){
                var book = $(this);
                var badge = book.find(".accordion-toggle:first span.badge:first");
                allChecked = book.find("input[type='checkbox']:checked")
                    .filter(function(){
                        return !$(this).parent().hasClass("accordion-heading");
                    });
                book.find(".accordion-toggle:first span.badge:first").text(allChecked.length ? allChecked.length : '');
            });
            this.trigger("badge-refresh", {badgeCount: badgeCount});
            Common.vent.trigger("chefSelectionChanged");
        },
        recalculatePuppetBadges: function(){
            var badgeCount = 0;
            var puppetContainer = $("#puppet-selection");
            var allChecked = puppetContainer.find("input[type='checkbox']:checked")
                .filter(function(){
                    return !$(this).parent().hasClass("accordion-heading");
                });
            puppetContainer.closest(".accordion-group").find(".accordion-toggle:first span.badge:first").text(allChecked.length ? allChecked.length : '');

            var modules = $("#puppet-selection>.accordion-group");
            modules.each(function(){
                var puppetClass = $(this);
                var badge = puppetClass.find(".accordion-toggle:first span.badge:first");
                allChecked = puppetClass.find("input[type='checkbox']:checked")
                    .filter(function(){
                        return !$(this).parent().hasClass("accordion-heading");
                    });
                puppetClass.find(".accordion-toggle:first span.badge:first").text(allChecked.length ? allChecked.length : '');
            });

            this.trigger("badge-refresh", {badgeCount: badgeCount});
            Common.vent.trigger("puppetSelectionChanged");


        },

        setupTypeAhead: function(){
             $("#configuration-management-library-source").typeahead({
                name: "configManagmentLibrarySource",
                prefetch: {
                    url: "samples/apps_puppet.json",
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
                $(this).closest('.accordion-body').css('overflow','visible').parent().closest('.accordion-body').css('overflow','visible'); // set overflow for current and parent accordion
                console.log("typeahed:opened");
            }).on('typeahead:closed', function() {
                $(this).closest('.accordion-body').css('overflow','hidden').parent().closest('.accordion-body').css('overflow','hidden');
                console.log("typeahed:closed");
            });
            
            console.log("Typeahead initialized.");
        },


        packageClick: function(evt, package) {
            this.listView.addApp(package);
            this.enableDeployLaunch();
            this.recalculatePuppetBadge();
            //this.updateDeployButtonState();
        },
        flashError: function(message){
            $("#msg").html(message);
            $(".alert")
                .addClass("alert-danger")
                .delay(200)
                .addClass("in")
                .show()
                .delay(5000)
                .fadeOut(4000, function(){
                    $(".alert").removeClass("alert-danger");
                });
        },
        getConfigs: function(toolId) {
            var configurations = {};

            var tool = $(toolId).val();
            if(tool === "Puppet"){
                var puppet = {};
                puppet["node_config"] = this.getPuppetConfig();
                configurations["puppet"] = puppet;
            }
            else if(tool === "Chef"){
                var chef = {};
                chef["env"] = $("#chefEnvironmentSelect :selected").val();
                chef["run_list"] = this.getChefConfig();
                configurations["chef"] = chef;
            }
            return {
                "configurations": configurations
            };
        },

        getChefConfig: function() {
            var runlist = [];
            $("input:checkbox[class=recipeSelector]:checked").each(function(index, object) {
                var recipeData = $(object.parentElement).data();
                runlist.push({
                    "type": "recipe",
                    "version": recipeData["cookbook"].get("latest_version"),
                    "name": recipeData["recipe"]["name"]
                });
            });
            return runlist;
        },
        getPuppetConfig: function() {
            var nodeConfig = [];
            $("input:checkbox[class=classSelector]:checked").each(function(index, object) {
                var classData = $(object.parentElement).data();
                nodeConfig.push({
                    "type": "class",
                    "id" : classData["class"]["id"],
                    "name": classData["class"]["name"]
                });
            });
            return nodeConfig;
        },

        close: function(){
            this.$el.empty();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
        }
    });
    return ConfigListView;
});