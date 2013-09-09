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
        'views/assemblies/assemblyRuntimeView',
        'common',
        'text!templates/assemblies/assemblyDesignTemplate.html',
        'collections/cloudCredentials',
        'collections/cookbooks',
        'collections/chefEnvironments',
        'collections/assemblies',
        'views/assemblies/configListView'
], function( $, _, bootstrap, Backbone, RuntimeView, Common,  assembliesTemplate, CloudCredentials, Cookbooks, ChefEnvironments, Assemblies, ConfigListView) {

    var AssemblyDesignView = Backbone.View.extend({

        tagName: 'div',

        template: _.template(assembliesTemplate),
        events: {
            "click .assembly" : "openAssembly",
            "change #assemblyDesignCloudCreds" : "credentialChangeHandler",
            "change #chefEnvironmentSelect" : "environmentSelectHandler",
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
            this.listView.render();
            this.cloudCredentials = new CloudCredentials();
            this.cloudCredentials.on('reset', this.populateCredentials, this);

            //Cloud Credentials fetch is asyncronous due to custom fetch behavior.
            this.cloudCredentials.fetch();



        },

        close: function(){
            this.$el.empty();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
        },

        populateAssemblySelect: function(assemblies){
            var selector = $("#assembly_menu");
            selector.empty();
            assemblies.each(function(assembly) {
                $("#assemblies_menu").append("<li><a id='"+assembly.id+"' class='assembly'>"+assembly.get("name")+"</a></li>");
            });
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

        openAssembly: function(evt){
            var $this = this;
            var id = evt.currentTarget.id;
            $("#designForm :input:reset");
            $("#designForm :input").each(function(){
                if(this.name){
                    var value = $this.assemblies.get(id).get(this.name);
                    this.value = value;
                }
            });
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
        }
    });

    return AssemblyDesignView;
});