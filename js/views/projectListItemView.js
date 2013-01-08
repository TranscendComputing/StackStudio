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
        'common'
], function( $, _, Backbone, ich, Common ) {
    
    var ProjectListItemView = Backbone.View.extend({
        
        //OR use tagName, className, ...
        tagName: "a",
        
        events: {
            'click' : 'select'
        },

        render: function() {
          this.$el.html( ich.project_item(this.model.attributes) );
          return this;  
        },
        
        select: function() {
            console.log('project below has been clicked');
            console.log(this.model);
            Common.vent.trigger('project:show', this.model);
        }
    });
    
    return ProjectListItemView;
});
