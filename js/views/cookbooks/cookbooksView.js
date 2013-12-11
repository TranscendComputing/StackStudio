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
        'text!templates/cookbooks/cookbooksTemplate.html'
], function( $, _, bootstrap, Backbone, Common, cookbooksTemplate) {

    var CookbooksView = Backbone.View.extend({

        tagName: 'div',
        id: 'cookbooks_view',

        template: _.template(cookbooksTemplate),

        events: {

        },

        initialize: function() {
            $("#main").html(this.el);
            this.$el.html(this.template);
        },

        render: function(){
            
        },

        close: function(){
            this.$el.empty();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
        }

    });

    var cookbooksView;

    Common.router.on('route:cookbooks', function () {
        if(sessionStorage.account_id) {
            if (this.previousView !== cookbooksView) {
                this.unloadPreviousState();
                cookbooksView = new CookbooksView();
                this.setPreviousState(cookbooksView);
            }
            cookbooksView.render();
        }else {
            Common.router.navigate("", {trigger: true});
            Common.errorDialog("Login Error", "You must login.");
        }
    }, Common);

    return CookbooksView;
});
