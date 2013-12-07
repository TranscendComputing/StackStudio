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
        //'text!templates/assemblies/configTreeTemplate.html',
        'text!templates/assemblies/configTreeTemplate.html',
        'collections/apps',
        'collections/cloudCredentials',
        'collections/cookbooks',
        'collections/chefEnvironments',
        'collections/puppetClasses',
        'collections/saltStates',
        'collections/ansibleJobTemplates',
        'views/assemblies/appListView',
        'models/app',
        /*'ace',
        'mode-json',*/
        'jquery-plugins',
        'jquery-ui-plugins',
        'jquery.dataTables',
        'jquery.dataTables.fnProcessingIndicator',
        'jquery.sortable'
],function( $, _, bootstrap, Backbone, ich, Common, appsTemplate, Apps,
    CloudCredentials, Cookbooks, ChefEnvironments, PuppetClasses, SaltStates,
    AnsibleJobTemplates, AppListView,
    App/*, ace*/ ) {

    var DockerConfigListView = Backbone.View.extend({
        id: 'config_list',

        //className: [''],

        template: _.template(appsTemplate),

        cloudProvider: undefined,

        appsApp: undefined,

        subViews: [],

        events: {
        },

        initialize: function(){
            Common.vent.trigger("console:mode:docker");
        },

        render: function () {
            /*
            this.editor = ace.edit("dockerfile_editor");
            this.editor.setTheme("ace/theme/monokai");
            this.editor.getSession().setUseWorker(false);
            this.editor.getSession().setMode("ace/mode/json");
            */
        },

        // Clean up view
        //
        close: function(){
            Common.vent.trigger("console:mode:cloud");
            this.$el.empty();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
        }
    });
    return DockerConfigListView;
});
