/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true alert:true*/
define([
        'jquery',
        'underscore',
        'backbone',
        'text!templates/errorDialogTemplate.html'
], function( $, _, Backbone, errorDialogTemplate) {

    var ErrorDialogView = Backbone.View.extend({
        
        events: {
            "click #error_accept_button": "close"
        },

        initialize: function ( options ) {

            var $newElement = $(errorDialogTemplate);
            this.setElement($newElement);

            var errorDialogView = this;
            var title, message;
            
            if(options.title) {
                title = options.title;
            }else {
                title = "Error";
            }

            this.$el.find('.error-title').text(title);
            
            if(options.message) {
                try {
                    var messageObject = JSON.parse(options.message);
                    message = messageObject["error"]["message"];
                }catch(error) {
                    message = options.message;
                }
            }else {
                message = "Invalid Request.";
            }

            this.$el.find('.error-message').text(message);

            this.render();
        },

        render : function () {
            var self = this;

            $('.modal.in').addClass('active-modal-window').modal('hide');

            $('body').append(this.$el);

            this.$el.modal({
                show : true,
                backdrop : true,
                keyboard : true
            });

            this.$el.on('hidden.bs.modal', function ( e ) {
                self.close();
            });
        },
        
        close: function() {
            this.$el.remove();
            var $active = $('.active-modal-window');

            if($active.length) {
                $active.modal('show');
            }
        }
    });
    
    return ErrorDialogView;
});
