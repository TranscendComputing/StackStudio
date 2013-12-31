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
        'views/assemblies/assemblyDesignView',
        'views/assemblies/assemblyRuntimeView',
        'common',
        'text!templates/assemblies/assembliesTemplate.html',
        'models/assembly',
        'collections/assemblies',
        'views/assemblies/configListView',
        'views/assemblies/dockerConfigListView'
], function( $, _, bootstrap, Backbone,DesignView, RuntimeView, Common,  assembliesTemplate,
    Assembly, Assemblies, ConfigListView,
    DockerConfigListView) {

    var AssembliesView = Backbone.View.extend({

        tagName: 'div',
        id: 'assemblies_view',

        template: _.template(assembliesTemplate),

        events: {
            "click .assembly" : "clickAssemblyHandler",
            "click .assembly-delete" : "deleteAssembly",
            "click #create_assembly_button" : "newAssemblyForm"
        },

        initialize: function() {
            $("#main").html(this.el);
            this.$el.html(this.template);
            Common.vent.on('assembly:changeTool', this.changeTool, this);
            Common.vent.on('global:modeChange', this.changeMode, this);
            //this.currentAssembly = new Assembly();
        },

        changeMode: function(mode) {
            if (this.tabView instanceof DesignView) {
                if($("#assemblyDesignTool").val() && $("#assemblyDesignTool").val() !== ""){
                    this.currentAssembly.set(this.listView.getConfigs("#assemblyDesignTool"));
                }
            }
            //$(this).tab('show');
            this.listView.close();
            this.tabView.close();
            this.listView = new ConfigListView();
            if (mode === "prod") {
                this.tabView = new RuntimeView({el: '#assemblyWork', listView:this.listView});
            } else if(mode ==="dev") {
                this.tabView = new DesignView({el: '#assemblyWork', assemblies:this.assemblies, listView:this.listView});
                if(this.currentAssembly.id){
                    this.openAssembly(this.currentAssembly);
                }
            }
        },

        render: function(){
            var $this = this;
            this.configureTabs();

            Common.vent.on("assembliesViewRefresh", this.fetchAssemblies, this);
            this.newAssemblyForm();
            this.assemblies = new Assemblies();
            this.fetchAssemblies();

        },

        configureTabs: function(){
            var $this = this;
            $("#assembliesTabs a:first").tab("show");
            this.listView = new ConfigListView();
            this.tabView = new DesignView({el:"#assemblyWork", assemblies:this.assemblies,listView:this.listView});
            //this.listView.render();
            $("#assembliesTabs a").click(function(e){
                e.preventDefault();
                if($this.tabView instanceof DesignView){
                    if($("#assemblyDesignTool").val() && $("#assemblyDesignTool").val() !== ""){
                        $this.currentAssembly.set($this.listView.getConfigs("#assemblyDesignTool"));
                    }
                }
                $(this).tab('show');


                $this.listView.close();
                $this.tabView.close();
                $this.listView = new ConfigListView();
                var targetID = $(this).attr("href");
                if (targetID === "#assemblyRuntime"){
                    $this.tabView = new RuntimeView({el: targetID, listView:$this.listView});
                }else if(targetID ==="#assemblyDesign"){
                    $this.tabView = new DesignView({el: targetID, assemblies:$this.assemblies, listView:$this.listView});
                    if($this.currentAssembly.id){
                        $this.openAssembly($this.currentAssembly);
                    }
                }
            });
        },

        close: function(){
            this.$el.empty();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
        },
        fetchAssemblies: function(model){
            var $this = this;
            this.assemblies.fetch({
                reset: true,
                success:function(collection, response, options){
                    $this.assemblies = $this.tabView.assemblies = collection;
                    //Need ID to get model from new collection;
                    var id = model ? model.id : $this.currentAssembly.id;
                    if(id){
                        $this.currentAssembly = $this.tabView.currentAssembly = collection.get(id);
                    }
                    $this.populateAssemblySelect();
                },
                error: function(xhr, response, options){
                    Common.errorDialog("Server Error", "Could not fetch assemblies.");
                }
            });
        },
        populateAssemblySelect: function(){
            var assemblies = this.assemblies;
            $("#assemblies_menu, #assemblies_delete_menu").empty();
            assemblies.each(function(assembly) {
                $("#assemblies_menu").append("<li><a id='"+assembly.id+"' class='assembly'>"+assembly.get("name")+"</a></li>");
                $("#assemblies_delete_menu").append("<li><a id='"+assembly.id+"' class='assembly-delete'>"+assembly.get("name")+"</a></li>");
            });
        },

        clickAssemblyHandler: function(evt){
            var id = evt.currentTarget.id;
            this.openAssembly(this.assemblies.get(id));

        },
        openAssembly: function(assembly){
            var $this = this;
            if(!(this.tabView instanceof DesignView)){
                $("#assembliesTabs a:first").click();
            }
            this.currentAssembly = assembly;
            $("#selectAssemblyButton span:first").html("Selected Assembly: " + this.currentAssembly.get("name"));
            $("#designForm :input:reset");
            this.tabView.currentAssembly = this.currentAssembly;
            this.tabView.listView = new ConfigListView();
            this.tabView.listView.loadingAssembly = true;
            this.tabView.listView.render();

            $("#designForm :input[type!='hidden']").each(function(){
                if(this.name){
                    var value = $this.currentAssembly.get(this.name);
                    this.value = value;
                }
            });
            Common.vent.once("imagesLoaded", function(){
                var imageData = $this.currentAssembly.get("image");
                if(imageData){
                    $this.findImage(imageData);
                }
            });
            $("#assemblyDesignCloudCreds").change();
            $("#assemblyDesignTool").change();

            var tool = this.currentAssembly.get("tool");
            var config = this.currentAssembly.get("configurations")[tool.toLowerCase()];

            switch(tool){
                case "Chef":
                    Common.vent.once("chefEnvironmentsPopulated", function(){
                        $("#chefEnvironmentSelect").val(config["env"]);
                        $("#chefEnvironmentSelect").change();
                    });
                    Common.vent.once("cookbooksLoaded", function(){
                        var recipeList = $this.sortListByContainer(config["run_list"]);
                        $this.selectRecipes(recipeList);
                    });
                    break;
                case "Puppet":
                    Common.vent.once("modulesLoaded", function(){
                        var classList = $this.sortListByContainer(config["node_config"]);
                        $this.selectConfigs(classList, "module", "class");
                    });
                    break;
                case "Salt":
                    Common.vent.once("formulasLoaded", function(){
                        var stateList = $this.sortListByContainer(config["minion_config"]);
                        $this.selectConfigs(stateList, "formula", "saltState");
                    });
                    break;
                case "Ansible":
                    Common.vent.once("jobtemplatesLoaded", function(){
                        var stateList = $this.sortListByContainer(config["jobtemplate_config"]);
                        $this.selectConfigs(stateList, "jobtemplate", "task");
                    });
                    break;
            }
        },
        findImage: function(imageData){
            var table = this.tabView.imageTable;
            var tableData = table.fnGetData();
            for(var i = 0; i < tableData.length; i++){
                if(tableData[i].label === imageData.label && tableData[i].description === imageData.description){
                    $(table.fnGetNodes(i)).addClass("row_selected");
                    return;
                }
            }
        },
        sortListByContainer: function(list){
            var containers = {};
            for(var i = 0; i < list.length; i++){
                var name = list[i]["name"];
                var container = name.split("::")[0];
                if(!containers[container]){
                    containers[container] = [];
                }
                containers[container].push(name);
            }
            return containers;
        },
        selectRecipes: function(cookbooks) {
            var $this = this;
            for (var name in cookbooks) {
                if (cookbooks.hasOwnProperty(name)) {
                    $this.lazyLoadRecipes(cookbooks[name], "#" + name + "-cookbook");
                }
            }
        },
        selectConfigs: function(list, type, subtype){
            for(var name in list){
                if(list.hasOwnProperty(name)){
                    var nodeList = $("#"+ name + "-"+ type).parent().find("li");
                    for(var i = 0; i < nodeList.length; i++){
                        var node = nodeList.get(i);
                        var nodeName = $(node).data(subtype).name;
                        if(list[name].indexOf(nodeName) !== -1){
                            $(node).find("input[type=checkbox]").click();
                        }
                    }
                }
            }
        },
        lazyLoadRecipes: function(recipes, destination) {
            var checkbox = $(destination).parent().find("input[type=checkbox]");
            var ul = $("<ul class='recipes'></ul>");
            var ver = checkbox.closest(".accordion-group")
                .find(".accordion-inner:first");
            ver.empty();
            var book = checkbox.closest(".accordion-group").data("cookbook");
            for (var i = 0; i < recipes.length; i++) {
                var item = {
                    name: recipes[i]
                }; //TODO: retrieve
                $("<li></li>")
                    .data("recipe", item)
                    .data("cookbook", book)
                    .data("isRecipe", true)
                    .append("<input type='checkbox' class='recipeSelector' checked='true' />")
                    .append("<span class='recipe'>" + item.name + "</span>" + "<span class='recipeDescription'>" + "" + "</span>")
                    .appendTo(ul);
                ver.append(ul);
            }



        },
        newAssemblyForm: function(){
            var $this =this;
            if(!this.confirmPageSwitch()){
                return;
            }
            $("#selectAssemblyButton span:first").html("Select Assembly");
            $("#designForm :input:reset");
            if(!(this.tabView instanceof DesignView)){
                $("#assembliesTabs a:first").click();
            }
            this.currentAssembly = new Assembly();
            this.tabView.currentAssembly = this.currentAssembly;

            this.tabView.listView.close();
            this.tabView.listView = new ConfigListView();
            this.tabView.listView.render();
            this.tabView.imageTable.fnClearTable();

            $("#designForm :input").each(function(){
                if(this.name === "cloud_credential"){
                    $this.listView.credential = $(this).find(":selected").data().cloudCredentials;
                    $(this).change();
                }
                else{
                    this.value = "";
                }
            });
        },
        deleteAssembly: function(evt){
            var assembly = this.assemblies.get(evt.currentTarget.id);
            var confirmation = confirm("Are you sure you want to delete " + assembly.get("name") + "?");
            if(confirmation){
                this.assemblies.deleteAssembly(assembly);
                if(this.currentAssembly.id === assembly.id){
                    this.currentAssembly = undefined;
                    this.newAssemblyForm();
                }
            }
        },
        confirmPageSwitch: function(){
            var confirmation = true;
            if(this.currentAssembly){
                if( this.currentAssembly.id){
                    confirmation = confirm("Any unsaved changes to " + this.currentAssembly.get("name") + " will be lost.");
                }
            }
            return confirmation;
        },
        changeTool: function(tool) {
            Common.vent.trigger("console:mode", tool);
            if (this.listView) {
                this.listView.close();
            }
            switch(tool){
                case "docker":
                    this.listView = new DockerConfigListView();
                    break;
                default:
                    this.listView = new ConfigListView();
                    break;
            }
            this.listView.render();
        }

    });

    var assembliesView;

    Common.router.on('route:assemblies', function () {
        if(sessionStorage.account_id) {
            if (this.previousView !== assembliesView) {
                this.unloadPreviousState();
                assembliesView = new AssembliesView();
                this.setPreviousState(assembliesView);
            }
            assembliesView.render();
        }else {
            Common.router.navigate("", {trigger: true});
            Common.errorDialog("Login Error", "You must login.");
        }
    }, Common);

    return AssembliesView;
});
