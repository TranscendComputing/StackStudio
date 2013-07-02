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
        'views/resource/resourceAppView',
        'text!templates/aws/cache/awsParameterGroupAppTemplate.html',
        '/js/aws/models/cache/awsCacheParameterGroup.js',
        '/js/aws/collections/cache/awsCacheParameterGroups.js',
        '/js/aws/views/cache/awsParameterGroupCreateView.js',
        'icanhaz',
        'common',
        'jquery.dataTables'
], function( $, _, Backbone, FeatureNotImplementedView, ResourceAppView,cacheParametersAppTemplate, CacheParameterGroup, CacheParameterGroups, CacheParameterGroupCreate, ich, Common ) {
    'use strict';

    var AwsParametergroupsAppView = ResourceAppView.extend({
        
        template: _.template(cacheParametersAppTemplate),
        
        modelStringIdentifier: "id",
        
        columns: ["id", "family", "description"],
        
        idColumnNumber: 0,
        
        model: CacheParameterGroup,
        
        collectionType: CacheParameterGroups,
        
        type: "cache",
        
        subtype: "parametergroups",
        
        CreateView: CacheParameterGroupCreate,
        
        events: {
            'click .create_button': 'createNew',
            'click #action_menu ul li': 'performAction',
            'click #resource_table tr': 'clickOne'
        },

        initialize: function(options) {
            if(options.cred_id) {
                this.credentialId = options.cred_id;
            }
            if(options.region) {
                this.region = options.region;
            }
            this.render();
            
            var cacheApp = this;
            Common.vent.on("parameterGroupAppRefresh", function() {
                cacheApp.render();
            });
            
        },
        
        performAction: function(event) {
            var cluster = this.collection.get(this.selectedId);
            
            switch(event.target.text)
            {
            case "Delete":
                cluster.destroy(this.credentialId, this.region);
                break;
            }
        },
        /*
        render: function() {
            var featureNotImplemented = new FeatureNotImplementedView({feature_url: "https://github.com/TranscendComputing/StackStudio/issues/8", element: "#resource_app"});
            featureNotImplemented.render();
        },
        */
        
        toggleActions: function(e) {
            //Disable any needed actions
        }
    });
    
    return AwsParametergroupsAppView;
});
