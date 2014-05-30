/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2014 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true requirejs:true require:true alert:true*/
define([
        'jquery',
        'underscore',
        'bootstrap',
        'backbone',
        'text!templates/meshes/meshesTemplate.html',
        'views/meshes/dashboardView',
        'views/meshes/gridsView',
        'views/meshes/appliancesView',
        'views/meshes/capsulesView',
        'models/mesh',
        'common'
], function( $, _, bootstrap, Backbone, meshesTemplate, DashboardView, GridsView, AppliancesView, CapsulesView, Mesh, Common ) {

    var MeshesView = Backbone.View.extend({

        tagName: 'div',

        template: _.template(meshesTemplate),

        dashboardView: undefined,

        gridsView: undefined,

        appliancesView: undefined,

        capsulesView: undefined,

        events: {
            'click #meshes_tabs a': 'changeTabs'
        },

        initialize: function() {
            $('#main').html(this.el);
            this.$el.html(this.template);
            var meshesView = this;
        },

        render: function(){
            this.changeTabs();
        },

        changeTabs: function(evt) {
            console.log('changing Tabs');
            if (evt) {
                switch($(evt.target).attr('href')) {
                case '#dashboard_tab':
                    console.log('Switching to DashboardView');
                    if(!this.dashboardView) {
                        this.dashboardView = new DashboardView();
                    }
                    this.dashboardView.render();
                    break;
                case '#grids_tab':
                    console.log('Switching to GridsView');
                    if(!this.gridsView) {
                        this.gridsView = new GridsView();
                    }
                    this.gridsView.render();
                    break;
                case '#appliances_tab':
                    console.log('Switching to AppliancesView');
                    if(!this.appliancesView) {
                        this.appliancesView = new AppliancesView();
                    }
                    this.appliancesView.render();
                    break;
                case '#capsules_tab':
                    console.log('Switching to CapsulesView');
                    if(!this.capsulesView) {
                        this.capsulesView = new CapsulesView();
                    }
                    this.capsulesView.render();
                    break;
                }
            }
        },

        close: function(){
            this.$el.empty();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
        }
    });

    var meshesView;

    Common.router.on('route:meshes', function () {
        if(sessionStorage.account_id) {
            if (this.previousView !== meshesView) {
                this.unloadPreviousState();
                meshesView = new MeshesView();
                this.setPreviousState(meshesView);
            }
            meshesView.render();
        }else {
            Common.router.navigate('', {trigger: true});
            Common.errorDialog('Login Error', 'You must login.');
        }
    }, Common);

    return meshesView;
});
