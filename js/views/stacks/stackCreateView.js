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
        'models/stack',
        'bootstrap'
], function( $, _, Backbone, Common, stackCreateTemplate, Stack ) {

    var StackCreateView = Backbone.View.extend({
        
        template: _.template(stackCreateTemplate),

        events: {
            "click #submit_button": "save",
            "click #cancel_button": "close"
        },

        initialize: function(options) {
            this.$el.html(this.template);
            this.$el.modal();
        },
        
        render: function() {
            
        },

        save: function() {
            var stack = new Stack();
            var valid = true;
            var options = {};
            options["account_id"] = sessionStorage.account_id;
            if($("#stack_name_input").val() !== "") {
                options["name"] = $("#stack_name_input").val();
            }else {
                valid = false;
            }
            if($("#stack_description_input").val() !== "") {
                options["description"] = $("#stack_description_input").val();
            }
            options["compatible_clouds"] = $("#stack_compatible_clouds_select").val();
            options["template"] = "{" +
                "\n\t\"AWSTemplateFormatVersion\": \"2010-09-09\"," +
                "\n\t\"Description\": \"New template created in StackStudio.\"," +
                "\n\t\"Parameters\": {}," +
                "\n\t\"Mappings\": {}," +
                "\n\t\"Resources\": {}," +
                "\n\t\"Outputs\": {}" +
            "\n}";
            if(valid) {
                stack.create(options);
                this.close();
            }else {
                alert("Please provide a name for the stack.");
            }
        },

        close: function() {
            $(this.$el).remove();
            $('body').removeClass('modal-open');
            $('.modal-backdrop').remove();
        }

    });
    
    return StackCreateView;
});
