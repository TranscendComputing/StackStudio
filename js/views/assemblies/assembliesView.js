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
        'collections/cookbooks',
        'collections/chefEnvironments',
        'views/assemblies/configListView'
], function( $, _, bootstrap, Backbone,DesignView, RuntimeView, Common,  assembliesTemplate,  Cookbooks, ChefEnvironments, ConfigListView) {

    var AssembliesView = Backbone.View.extend({

        tagName: 'div',

        template: _.template(assembliesTemplate),

        initialize: function() {
            $("#main").html(this.el);
            this.$el.html(this.template);
        },

        configureTabs: function(){
            var $this = this;
            $("#assembliesTabs a:first").tab("show");
            this.listView = new ConfigListView();
            this.tabView = new DesignView({listView:this.listView});
            //this.listView.render();
            $("#assembliesTabs a").click(function(e){
                e.preventDefault();
                $(this).tab('show');

                $this.listView.close();
                $this.tabView.close();
                $this.listView = new ConfigListView();
                var targetID = $(this).attr("href");
                if (targetID === "#assemblyRuntime"){
                    $this.tabView = new RuntimeView({el: targetID, model: {}, listView:$this.listView});
                    //$this.listView.render();
                }else if(targetID ==="#assemblyDesign"){
                    $this.tabView = new DesignView({el: targetID, model:{}, listView:$this.listView});
                    //$this.listView.render();
                }
                //$this.tabView.render();
            });
        },

        render: function(){
            var $this = this;
            this.configureTabs();

        },

        close: function(){
            this.$el.empty();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
        },

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