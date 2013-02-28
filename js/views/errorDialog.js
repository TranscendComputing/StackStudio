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
        
        tagName: "div",
        
        events: {
            "dialogclose": "close"
        },

        initialize: function(options) {
            var compiledTemplate = _.template(errorDialogTemplate);
            this.$el.html(compiledTemplate);
            var errorDialogView = this;
            var title, message;
            if(options.title) {
                title = options.title;
            }else {
                title = "";
            }
            
            if(options.message) {
                try {
                    var messageObject = JSON.parse(options.message);
                    message = messageObject["error"]["message"];
                }catch(error) {
                    message = options.message;
                }
            }else {
                message = "";
            } 

            this.$el.dialog({
                title: title,
                autoOpen: true,
                width:300,
                minHeight: 150,
                resizable: false,
                modal: true,
                buttons: [
                    {
                        text: "Ok",
                        click: function() {
                            errorDialogView.ok();
                        }
                    }
                ]
            });
            $("#message").text(message);
        },
        
        ok: function() {
            this.$el.dialog('close');
        },
        
        close: function() {
            this.$el.remove();
        }
    });
    
    return ErrorDialogView;
});
