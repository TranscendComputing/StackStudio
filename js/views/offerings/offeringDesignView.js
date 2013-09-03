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
        'models/offering',
        'collections/stacks',
        'text!templates/offerings/offeringDesignViewTemplate.html'
], function( $, _, bootstrap, Backbone, Common, Offering, Stacks, offeringDesignViewTemplate ) {

    var OfferingDesignView = Backbone.View.extend({

        tagName: 'div',

        template: _.template(offeringDesignViewTemplate),

        model: null,
        
        events: {
            "click button[data-action='save']": "saveOfferingClick",
            "click button[data-action='cancel']": "cancelOfferingEditClick",
            "click button[data-action='delete']": "deleteOfferingClick"
        },

        initialize: function() {
            
        },

        render: function(){
            this.loadStacks();
            var s = this.template({model: this.model});
            this.$el.html(s);
        },

        loadStacks: function(){
            var $this = this;
            this.fetchStacks()
                .done(function(model){
                    $this.renderStacks(model);
                })
                .fail(function(obj){
                    $this.showErrors(obj.errors);
                });
        },

        renderStacks: function(stacks){
            var list = $("#stacksList").empty();
            stacks.each(function(stack){
                $('<li><label class="checkbox"><input type="checkbox" value="' + stack.get("id") + '" style="margin-top:1px"> ' + stack.get("name") + '</label></li>')
                    .appendTo(list);
            });
        },

        fetchStacks: function(){
            var deferred = $.Deferred();
            var $this = this;
            Stacks.fetch({
                data: {
                    //TODO: What data is necessary for stacks?
                },
                success: function(model){
                    deferred.resolve(model);
                },
                error: function(model, errors){
                    deferred.reject({model: model, errors:errors});
                }
            });
            return deferred.promise();
        },

        saveOffering: function(){
            var $this = this;
            this.model.save({
                success:function(){
                    $this.hideErrors();
                    this.trigger("offeringSaved");
                },
                error:function(model,errors){
                    $this.showErrors(errors);
                }
            });
        },

        deleteOffering: function(){
            var $this = this;
            this.model.destroy({
                success:function(){
                    $this.hideErrors();
                    this.trigger("offeringDeleted");
                },
                error:function(model,errors){
                    $this.showErrors(errors);
                }
            });
        },

        saveOfferingClick: function(evt){
            this.saveOffering();
        },
        
        cancelOfferingEditClick: function(evt){
            this.trigger("offeringEditCancelled");
        },
        
        deleteOfferingClick: function(evt){
            this.deleteOffering();
        },

        showSuccess: function(){
            //TODO: Show success message only if this object is still visible.
        },

        showErrors: function(errors){
            _.each(errors, function (error) {
                //TODO: Display error messages
            }, this);
        },

        hideErrors: function(){
            //TODO: Hide errors
        },
        
        close: function(){
            this.$el.empty();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
        }
    });

    var offeringDesignView;

    Common.router.on('route:offeringsEdit', function () {
        if(sessionStorage.account_id) {
            if (this.previousView !== offeringDesignView) {
                this.unloadPreviousState();
                offeringDesignView = new OfferingDesignView();
                this.setPreviousState(offeringDesignView);
            }
            offeringDesignView.render();
        }else {
            Common.router.navigate("", {trigger: true});
            Common.errorDialog("Login Error", "You must login.");
        }
    }, Common);

    return OfferingDesignView;
});
