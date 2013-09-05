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
        'views/stacks/stackCreateView',
        'collections/stacks'
], function( $, _, bootstrap, Backbone, Common, stacksTemplate, StackDesignView, StackRunView, StackCreateView, Stacks ) {

    var StacksView = Backbone.View.extend({

        tagName: 'div',

        template: _.template(stacksTemplate),

        stackDesignView: undefined,

        stackRunView: undefined,

        stacks: undefined,

        events: {
            "click #create_stack_button": "createStack",
            "click #delete_stack_button": "deleteStack",
            "click .stack": "openStack"
        },

        initialize: function() {
            $("#main").html(this.el);
            this.stackDesignView = undefined;
            this.stackRunView = undefined;
            this.$el.html(this.template);
            this.stacks = new Stacks();
            this.stacks.on( 'reset', this.addAllStacks, this );
            var stackApp = this;
            Common.vent.off("stackCreated");
            Common.vent.on("stackCreated", function(newStack) {
                if(!sessionStorage.stack_id) {
                    sessionStorage.stack_id = newStack.stack._id;
                    sessionStorage.stack_name = newStack.stack.name;
                    stackApp.render();
                }else {
                    var confirmation = confirm("Are you sure you want to open " + newStack.stack.name + "? Any unsaved changes to " + 
                        sessionStorage.stack_name + " will be lost.");
                    if(confirmation == true) {
                        sessionStorage.stack_id = newStack.stack._id;
                        sessionStorage.stack_name = newStack.stack.name;
                    }
                }
                stackApp.stacks.fetch({reset: true});
            });
            Common.vent.off("stackDeleted");
            Common.vent.on("stackDeleted", function() {
                sessionStorage.removeItem("stack_id");
                sessionStorage.removeItem("stack_name");
                stackApp.stacks.fetch({reset: true});
                stackApp.render();
            });
        },

        render: function() {
            if(sessionStorage.stack_id) {
                $("#manage_stack_content").html(
                    '<ul class="nav nav-tabs">' +
                        '<li id="design-tab" class="active"><a href="#tabs-design" data-toggle="tab">Design Time</a></li>' +
                        '<li><a href="#tabs-run" data-toggle="tab">Run Time</a></li>' +
                    '</ul>' +
                    '<div class="tab-content">' +
                        '<div id="tabs-design" class="tab-pane active">' +
                            '<div id="design_time_content">' +
                            '</div>' +
                        '</div>' +
                        '<div id="tabs-run" class="tab-pane">' +
                            '<div id="run_time_content">' +
                            '</div>' +
                        '</div>' +
                    '</div>'
                );
                //Add event when tabs change
                $('a[data-toggle="tab"]').off('shown');
                var stacksView = this;
                $('a[data-toggle="tab"]').on('shown', function (e) {
                    stacksView.changeTabs();
                });
                this.changeTabs();
            } else {
                $("#manage_stack_content").html(
                    '<div class="hero-unit">' +
                        '<h3>Select a stack above, or begin by creating a new stack!</h3>' +
                    '</div>'
                );
            }

            this.stacks.fetch({reset: true});
        },

        changeTabs: function() {
            if($("#design-tab").hasClass("active")) {
                if(!this.stackDesignView) {
                    this.stackDesignView = new StackDesignView();
                }
                this.stackDesignView.render();
            }else {
                if(!this.stackRunView) {
                    this.stackRunView = new StackRunView();
                    if(sessionStorage.stack_id)
                    {
                        this.stackRunView.setStack(this.stacks.get(sessionStorage.stack_id));
                    }
                }
                this.stackRunView.render();
            }
        },

        addAllStacks: function() {
            $("#stacks_menu").empty();
            this.stacks.each(function(stack) {
                $("#stacks_menu").append("<li><a id='"+stack.id+"' class='stack'>"+stack.attributes.name+"</a></li>");
            });
            if(sessionStorage.stack_id) {
                this.stackDesignView.setStack(this.stacks.get(sessionStorage.stack_id));
            }
        },

        openStack: function(event) {
            var stack = this.stacks.get(event.target.id);
            sessionStorage.stack_id = stack.id;
            sessionStorage.stack_name = stack.attributes.name;
            this.render();
        },

        createStack: function() {
            new StackCreateView();
        },

        deleteStack: function() {
            var stack = this.stacks.get(sessionStorage.stack_id);
            if(stack) {
                var confirmation = confirm("Are you sure you want to delete " + sessionStorage.stack_name + "?");
                if(confirmation == true) {
                    stack.destroy();
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
