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
        'text!templates/stacks/stackRunTemplate.html'
], function( $, _, Backbone, Common, stacksRunTemplate ) {
    'use strict';

    var StackRunView = Backbone.View.extend({

        template: _.template( stacksRunTemplate ),

        events: {
            
        },

        initialize: function() {
            $("#run_time_content").html(this.el);
            this.$el.html(this.template);
        },

        render: function() {
            
        }
    });

    return StackRunView;
});