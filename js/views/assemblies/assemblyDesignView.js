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
        'common',
        'text!templates/assemblies/assemblyDesignTemplate.html',
        'collections/chefEnvironments',
        'collections/cloudCredentials',
        'models/assembly',
        'collections/assemblies',
        'views/assemblies/configListView'
], function( $, _, bootstrap, Backbone, Common,  assemblyDesignTemplate, ChefEnvironments, CloudCredentials,  Assembly, Assemblies, ConfigListView) {

    var AssemblyDesignView = Backbone.View.extend({

        tagName: 'div',
        id: 'assembly_design_view',
        currentAssembly: undefined,

        template: _.template(assemblyDesignTemplate),
        events: {
            //"change #assemblyDesignCloudCreds" : "credentialChangeHandler",
            "change #chefEnvironmentSelect" : "environmentSelectHandler",
            "click #save-assembly" : "saveAssemblyHandler",
            "change input,textarea,select" : "formChanged"
            //"shown" : "accordionShown"
        },

        environmentSelectHandler: function(evt){
            this.listView.environmentSelectHandler(evt);
        },
        initialize: function(options) {
            console.log("Initialize assembly design view.");
            $("#assemblyDesign").html(this.el);
            this.$el.html(this.template);
            this.listView = options.listView;
            this.assemblies = options.assemblies;
            this.currentAssembly = new Assembly();

            this.listView.render();
            this.cloudCredentials = new CloudCredentials();
            this.cloudCredentials.on('reset', this.populateCredentials, this);

            //Cloud Credentials fetch is asyncronous due to custom fetch behavior.
            this.cloudCredentials.fetch();

            // $("#assemblyDesignImagesTable").dataTable({
            //     bjQueryUI:true
            // });



        },

        close: function(){
            this.$el.empty();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
        },

        populateCredentials: function(){
            var list = this.cloudCredentials;
            var select = $("#assemblyDesignCloudCreds")
                .empty()
                .on("change", $.proxy(this.credentialChangeHandler, this));
            list.forEach(function(element, index, list){
                $('<option>')
                    .text(element.get("cloud_name") + ":" + element.get("name"))
                    .data("cloudCredentials", element)
                    .appendTo(select);
            });
            select.trigger("change");
        },
        credentialChangeHandler: function(evt){
            var $this = this;
            var optionSelected = $("option:selected", evt.target);
            var credential = this.credential = optionSelected.data("cloudCredentials");
            if (!credential){
                this.flashError("We're sorry.  Cloud credentials could not be retrieved.");
                return;
            }

            this.listView.credential = credential;
            this.listView.fetchChefEnvironments().done(function(model){
                $this.listView.populateChefEnvironments(new ChefEnvironments(model));
            });
        },
        saveAssemblyHandler: function(e){
            e.preventDefault();
            var configs = this.getConfigs();
            this.currentAssembly.set(configs);
            //If no id, then it's a new assembly.  Otherwise, update existing assembly.
            if(!this.currentAssembly.id){
                this.assemblies.createAssembly(this.currentAssembly, {});
            }
            else{
                this.currentAssembly.save({},{
                    success:function(){
                        Common.vent.trigger("assembliesViewRefresh");
                    },
                    error:function(){
                        Common.errorDialog("Server Error", "Could not save assembly.");
                    }
                });
            }
        },
        formChanged: function(evt) {
            var changed = evt.currentTarget;
            var value = $(evt.currentTarget).val();
            var obj = {};
            var attrs = _.clone(this.currentAssembly.attributes);
            attrs[changed.name] = value;
            this.currentAssembly.set(attrs);
        },
        getConfigs: function() {
            var configurations = {};
            var chef = {};
            chef["env"] = $("#chefEnvironmentSelect :selected").val();
            chef["run_list"] = this.getRunlist();
            configurations["chef"] = chef;
            return {"configurations": configurations};
        },
        getRunlist: function(){
            var runlist = [];
            $("input:checkbox[class=recipeSelector]:checked").each(function(index, object){
                runlist.push("recipe[" + $(object.parentElement).find(".recipe").text() + "]");
            });
            return runlist;
        },
    });

    return AssemblyDesignView;
});