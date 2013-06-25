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
        '/js/aws/views/cache/awsClusterModifyView.js',
        'icanhaz',
        'common',
        'jquery.dataTables'
], function( $, _, Backbone, FeatureNotImplementedView, ResourceAppView,cacheClusterAppTemplate, CacheCluster, CacheClusters, CacheClusterCreate, CacheClusterModify, ich, Common ) {
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
        
        ModifyView: CacheClusterModify,
        
        events: {
            'click .create_button': 'createNew',
            'click #action_menu ul li': 'performAction',
            'click #resource_table tr': 'clickOne',
            'change #node_select': 'selectNode',
            'click #modnodes': 'modNodes'
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
        },
        
        selectNode: function(e) {
            var cluster = this.collection.get(this.selectedId);
            
            var detailString = "";
            
            detailString += "<br><b>CacheNodeId:</b> ";
            detailString += $("#cid"+$("#node_select").val()).html();
            detailString += "<br><b>ParameterGroupStatus:</b> ";
            detailString += $("#pgs"+$("#node_select").val()).html();
            detailString += "<br><b>CacheNodeStatus:</b> ";
            detailString += $("#cns"+$("#node_select").val()).html();
            detailString += "<br><b>CacheNodeCreateTime:</b> ";
            detailString += $("#cnct"+$("#node_select").val()).html();
            detailString += "<br><b>Port:</b> ";
            detailString += $("#port"+$("#node_select").val()).html();
            detailString += "<br><b>Address:</b> ";
            detailString += $("#address"+$("#node_select").val()).html();
            
            $("#node_detail").html(detailString);
        },
        
        modNodes: function(e) {
            var ModifyView = this.ModifyView;
            if(this.region) {
                this.newResourceDialog = new ModifyView({cred_id: this.credentialId, region: this.region});
            }else {
                this.newResourceDialog = new ModifyView({cred_id: this.credentialId});
            }
            this.newResourceDialog.render();
        }
    });
    
    return AwsClustersAppView;
});
