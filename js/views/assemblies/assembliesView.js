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
            "click .assembly" : "openAssembly",
            "click .assembly-delete" : "deleteAssembly",
            "click #create_assembly_button" : "newAssemblyForm",
            //"click #delete_assembly_button" : "deleteAssembly"
        },

        initialize: function() {
            $("#main").html(this.el);
            this.$el.html(this.template);
            this.currentAssembly = new Assembly();
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
                }
            });
        },

        render: function(){
            var $this = this;
            this.configureTabs();

            Common.vent.on("assembliesViewRefresh", this.populateAssemblySelect, this);

            this.assemblies = new Assemblies();
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

        close: function(){
            this.$el.empty();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
        },

        populateAssemblySelect: function(){
            var assemblies = this.assemblies;
            $("#assemblies_menu, #assemblies_delete_menu").empty();
            assemblies.each(function(assembly) {
                $("#assemblies_menu").append("<li><a id='"+assembly.id+"' class='assembly'>"+assembly.get("name")+"</a></li>");
                $("#assemblies_delete_menu").append("<li><a id='"+assembly.id+"' class='assembly-delete'>"+assembly.get("name")+"</a></li>");
            });
        },

        openAssembly: function(evt){
            $("#assembliesTabs a:first").trigger("click");
            var $this = this;
            var id = evt.currentTarget.id;
            this.currentAssembly = this.assemblies.get(id);
            this.tabView.currentAssembly = this.currentAssembly;
            $("#designForm :input:reset");
            $("#designForm :input").each(function(){
                if(this.name){
                    var value = $this.currentAssembly.get(this.name);
                    this.value = value;
                }
            });
        },
        newAssemblyForm: function(evt, justDeleted){
            if(!justDeleted && !this.confirmPageSwitch())
                return;
            $("#designForm :input:reset");
            this.currentAssembly = new Assembly();
            this.tabView.currentAssembly = this.currentAssembly;
            $("#designForm :input").each(function(){
                this.value = "";
            });
        },
        deleteAssembly: function(evt){
            var assembly = this.assemblies.get(evt.currentTarget.id);
            var confirmation = confirm("Are you sure you want to delete " + assembly.get("name") + "?");
            if(confirmation)
                this.assemblies.deleteAssembly(assembly);
        },
        confirmPageSwitch: function(){
            var confirmation;
            if(this.currentAssembly.id){
                confirmation = confirm("Any unsaved changes to " + this.currentAssembly.get("name") + " will be lost.");
            }else
                confirmation = confirm("Any unsaved changes will be lost");
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