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
        'views/assemblies/configListView'
], function( $, _, bootstrap, Backbone,DesignView, RuntimeView, Common,  assembliesTemplate, Assembly, Assemblies, ConfigListView) {

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
            //this.currentAssembly = new Assembly();
        },

        configureTabs: function(){
            var $this = this;
            $("#assembliesTabs a:first").tab("show");
            this.listView = new ConfigListView();
            this.tabView = new DesignView({el:"#assemblyDesign", assemblies:$this.assemblies,listView:this.listView});
            //this.listView.render();
            $("#assembliesTabs a").click(function(e){
                e.preventDefault();
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
                        $this.openAssembly($this.currentAssembly.id);
                    }else{
                        $this.newAssemblyForm();
                    }
                }
            });
        },

        render: function(){
            var $this = this;
            this.configureTabs();

            Common.vent.on("assembliesViewRefresh", this.fetchAssemblies, this);
            this.newAssemblyForm();
            this.assemblies = new Assemblies();
            this.fetchAssemblies();
            
        },

        close: function(){
            this.$el.empty();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
        },
        fetchAssemblies: function(){
            var $this = this;
            this.assemblies.fetch({
                reset: true,
                success:function(collection, response, options){
                    $this.assemblies = collection;
                    $this.tabView.assemblies = collection;
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
            this.openAssembly(id);
            
        },
        openAssembly: function(id){
            var $this = this;
            if(!(this.tabView instanceof DesignView)){
                $("#assembliesTabs a:first").click();
            }
            this.currentAssembly = this.assemblies.get(id);
            $("#designForm :input:reset");
            this.tabView.currentAssembly = this.currentAssembly;
            this.tabView.listView = new ConfigListView();
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
            if(this.currentAssembly.get("tool") === "Chef"){
                var chefConfig = this.currentAssembly.get("configurations")["chef"];
                Common.vent.once("chefEnvironmentsPopulated", function(){
                    $("#chefEnvironmentSelect").val(chefConfig["env"]);
                    $("#chefEnvironmentSelect").change();
                });
                Common.vent.once("cookbooksLoaded", function(){
                    var recipeList = $this.sortListByContainer(chefConfig["run_list"]);
                    $this.selectRecipes(recipeList);
                });
            }else if(this.currentAssembly.get("tool") === "Puppet"){
                var puppetConfig = this.currentAssembly.get("configurations")["puppet"];
                Common.vent.once("modulesLoaded", function(){
                    var classList = $this.sortListByContainer(puppetConfig["node_config"]);
                    $this.selectClasses(classList);
                });
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
            Common.errorDialog("Not found", "Could not find image saved with this assembly.");
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
        selectClasses: function(classes){
            for(var name in classes){
                if(classes.hasOwnProperty(name)){
                    var classNodeList = $("#"+name+"-module").parent().find("li");
                    for(var i = 0; i < classNodeList.length; i++){
                        var classNode = classNodeList.get(i);
                        var nodeName = $(classNode).data("class").name;
                        if(classes[name].indexOf(nodeName) !== -1){
                            $(classNode).find("input[type=checkbox]").click();
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
        newAssemblyForm: function(evt, justDeleted){
            if(!justDeleted && !this.confirmPageSwitch()){
                return;
            }
            $("#designForm :input:reset");
            this.currentAssembly = new Assembly();
            this.tabView.currentAssembly = this.currentAssembly;
            $("#designForm :input").each(function(){
                this.value = "";
            });
            this.tabView.listView.close();
            this.tabView.listView = new ConfigListView();
            this.tabView.listView.render();
            this.tabView.imageTable.fnClearTable();
        },
        deleteAssembly: function(evt){
            var assembly = this.assemblies.get(evt.currentTarget.id);
            var confirmation = confirm("Are you sure you want to delete " + assembly.get("name") + "?");
            if(confirmation){
                this.assemblies.deleteAssembly(assembly);
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