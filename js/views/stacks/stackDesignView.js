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
        'text!templates/stacks/stackDesignTemplate.html',
        'ace'
], function( $, _, Backbone, Common, stacksDesignTemplate, ace ) {
    'use strict';

    var StackDesignView = Backbone.View.extend({

        template: _.template( stacksDesignTemplate ),

        editor: undefined,

        events: {
            
        },

        initialize: function() {
            $("#design_time_content").html(this.el);
            this.$el.html(this.template);
            this.editor = ace.edit("design_editor");
            this.editor.setTheme("ace/theme/twilight");
            this.editor.getSession().setMode("ace/mode/json");
            

            this.editor.on("change", this.handleChange);
        },

        render: function() {
            
        },

        handleChange: function(e) {
            var editor = ace.edit("design_editor");
            var content = editor.getValue();
            Common.vent.trigger('project:updateTemplate', content);
        },
    });

    return StackDesignView;
});