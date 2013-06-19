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
        'text!templates/aws/cache/awsCacheClusterAppTemplate.html',
        '/js/aws/models/cache/awsCacheCluster.js',
        '/js/aws/collections/cache/awsCacheClusters.js',
        '/js/aws/views/cache/awsClusterCreateView.js',
        'icanhaz',
        'common',
        'jquery.dataTables'
], function( $, _, Backbone, FeatureNotImplementedView, ResourceAppView,cacheClusterAppTemplate, CacheCluster, CacheClusters, CacheClusterCreate, ich, Common ) {
    'use strict';

    var AwsClustersAppView = ResourceAppView.extend({
        
        template: _.template(cacheClusterAppTemplate),
        
        modelStringIdentifier: "id",
        
        columns: ["id", "status", "node_type", "engine", "zone", "num_nodes"],
        
        idColumnNumber: 0,
        
        model: CacheCluster,
        
        collectionType: CacheClusters,
        
        type: "cache",
        
        subtype: "clusters",
        
        CreateView: CacheClusterCreate,
        
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
            Common.vent.on("cacheAppRefresh", function() {
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
    
    return AwsClustersAppView;
});
