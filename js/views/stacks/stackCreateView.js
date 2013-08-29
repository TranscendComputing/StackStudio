/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
define([
        'jquery',
        'underscore',
        'backbone',
        'common',
        'text!templates/stacks/stackCreateTemplate.html',
        'bootstrap'
], function( $, _, Backbone, Common, stackCreateTemplate ) {

    var StackCreateView = Backbone.View.extend({
        
        template: _.template(stackCreateTemplate),

        events: {
            "click #submit_button": "save",
            "click #cancel_button": "close",
        },

        initialize: function(options) {
            this.$el.html(this.template);
            this.$el.modal();
        },
        
        render: function() {
            
        },

        save: function() {
            this.close();
        },

        close: function() {
            $(this.$el).remove();
            $('body').removeClass('modal-open');
            $('.modal-backdrop').remove();
        }

    });
    
    return StackCreateView;
});
