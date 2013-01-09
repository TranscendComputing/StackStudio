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
        'icanhaz',
        'common',
        'wijmo'
], function( $, _, Backbone, ich, Common ) {
    
    var ProjectCreateView = Backbone.View.extend({
        
        //OR use tagName, className, ...
        tagName: "div",
        
        id: "new_project",
                
        events: {
            'click .hover_panel' : 'close'
        },

        render: function() {
          
          this.$el.append( ich.new_project_window() );
          $("#main").append(this.$el);
          this.$el.wijdialog({
                autoOpen: false,
                captionButtons: {
                    refresh: {visible: false},
                    pin: {visible: false},
                    toggle: {visible: false},
                    minimize: {visible: false},
                    maximize: {visible: false}
                },
                minWidth: 400,
                modal: true
          });
          
          return this;  
        },
        
        close: function() {
            this.overlay.remove();
            this.remove();
            return false;
        }
        
        
    });
    
    return ProjectCreateView;
});
