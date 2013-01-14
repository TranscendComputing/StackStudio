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
        'models/stack',
        'icanhaz',
        'common',
        'wijmo'
], function( $, _, Backbone, Stack, ich, Common ) {
    
    var ProjectNewTemplateView = Backbone.View.extend({
        
        tagName: 'ul',
        
        events: {
            'click .hover_panel' : 'create'
        },
        
        render: function() {
          
          this.$el.append( ich.sample_project( this.model.attributes ) );
          
          return this;  
        },
        
        create: function() {
            console.log('Creating project...');
            Common.vent.trigger('project:create', this.model);
            return false;
        }
        
    });
    
    return ProjectNewTemplateView;
});
