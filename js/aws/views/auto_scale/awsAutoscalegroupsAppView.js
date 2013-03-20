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
        'views/featureNotImplementedView',
        'views/resourceAppView',
        'icanhaz',
        'common',
        'jquery.dataTables'
], function( $, _, Backbone, FeatureNotImplementedView, ResourceAppView, ich, Common ) {
    'use strict';

    var AwsAutoScaleGroupsAppView = ResourceAppView.extend({

        type: "auto_scale",
        
        subtype: "autoscalegroups",
        
        events: {
            'click .create_button': 'createNew',
            'click #resource_table tr': 'clickOne'
        },

        initialize: function() {
            var featureNotImplemented = new FeatureNotImplementedView({feature_url: "https://github.com/TranscendComputing/StackStudio/issues/8", element: "#resource_app"});
            featureNotImplemented.render();
        },
        
        toggleActions: function(e) {
            //Disable any needed actions
        }
    });
    
    return AwsAutoScaleGroupsAppView;
});
