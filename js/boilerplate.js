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
    
    var BackboneElement = Backbone.View.extend({
        
        //TODO define element
        //OR use tagName, className, ...
        el: "#REPLACE_ME",
        
        //TODO define template
        template: _.template(),
        
        events: {
            //TODO handle events
        },
        
        
        initialize: function(){
            //TODO place any initialization actions here
        },
        
        render: function() {
          //TODO render view
          return this;  
        },
        
        // Add any custom actions here..
    });
    
    var placeHolderView;
    
    Common.router.on('route:DEFINE_ROUTE_EVENT', function () {
        if (!placeHolderView) {
            placeHolderView = new BackboneElement();
        }
        console.log("Got new view.");
    }, this);
    
    return BackboneElement;
});
