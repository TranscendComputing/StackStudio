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
        'text!templates/stacks/stacksTemplate.html',
        'views/stacks/stackDesignView',
        'views/stacks/stackRunView',
        'views/stacks/stackCreateView'
], function( $, _, bootstrap, Backbone, Common, stacksTemplate, StackDesignView, StackRunView, StackCreateView ) {

    var StacksView = Backbone.View.extend({

        tagName: 'div',

        template: _.template(stacksTemplate),

        stackDesignView: undefined,

        stackRunView: undefined,

        events: {
            "click #create_stack_button": "createStack"
        },

        initialize: function() {
            $("#main").html(this.el);
            this.$el.html(this.template);

            //Add event when tabs change
            $('a[data-toggle="tab"]').off('shown');
            var stacksView = this;
            $('a[data-toggle="tab"]').on('shown', function (e) {
                stacksView.changeTabs();
            });
        },

        render: function() {
            this.stackDesignView = undefined;
            this.stackRunView = undefined;
            this.changeTabs();
        },

        changeTabs: function() {
            if($("#tabs-design").hasClass("active")) {
                if(!this.stackDesignView) {
                    this.stackDesignView = new StackDesignView();
                }
                this.stackDesignView.render();
            }else {
                if(!this.stackRunView) {
                    this.stackRunView = new StackRunView();
                }
                this.stackRunView.render();
            }
        },

        createStack: function() {
            new StackCreateView();
        },

        close: function(){
            this.$el.empty();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
        }
    });

    var stacksView;

    Common.router.on('route:stacks', function () {
        if(sessionStorage.account_id) {
            if (this.previousView !== stacksView) {
                this.unloadPreviousState();
                stacksView = new StacksView();
                this.setPreviousState(stacksView);
            }
            stacksView.render();
        }else {
            Common.router.navigate("", {trigger: true});
            Common.errorDialog("Login Error", "You must login.");
        }
    }, Common);

	return StacksView;
});
