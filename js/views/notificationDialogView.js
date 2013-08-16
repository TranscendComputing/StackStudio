/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true requirejs:true require:true*/
define([
        'jquery',
        'underscore',
        'backbone',
        'icanhaz',
        'text!templates/notificationDialogTemplate.html',
        'jquery-plugins',
        'jquery-ui-plugins'
], function( $, _, Backbone, ich, notificationDialogTemplate) {

    var NotificationDialogView = Backbone.View.extend({
        /** @type {Template} HTML template to generate view from */
        template: _.template(notificationDialogTemplate),
        /** Constructor method for current view */
        initialize: function(options) {
            this.dialog_title = options.dialog_title;
            this.message = options.message;
            this.render();
        },
        /** Add all of my own html elements */
        render: function () {
            //Render my template
            ich.addTemplate("dialog_message", this.template());
            var dialog =  ich.dialog_message({title: this.dialog_title, message: this.message});
            //Render my template
            this.$el.html(dialog);
            this.$el.dialog({
                resizable: false,
                modal: true,
                buttons: {
                    Ok: function () {
                        $(this).dialog("close");
                    }
                }
            });            
        }    
    });

    return NotificationDialogView;
});
