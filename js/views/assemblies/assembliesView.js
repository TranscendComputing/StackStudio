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
        //'views/assemblies/assemblyDesignView',
        'views/apps/appsAndPlatformsView',
        'common',
        //'models/assembly',
        'text!templates/assemblies/assembliesTemplate.html'
], function( $, _, bootstrap, Backbone, RuntimeView, Common,  assembliesTemplate ) {

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

            $("#assembliesTabs a").click(function(e){
                e.preventDefault();
                $(this).tab('show');
                var targetID = $(this).attr("href");
                if (targetID === "#assemblyRuntime"){
                    var appsView = new RuntimeView({el: targetID, model: {}});
                    appsView.render();
                }
            });
        },

        render: function(){
            this.configureTabs();
        },

        close: function(){
            this.$el.empty();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
        }
    });

    var assembliesView;

    Common.router.on('route:apps', function () {
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