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
        'aws/models/cache/awsCacheParameterGroup',
        'aws/collections/cache/awsCacheParameterGroups',
        'aws/views/cache/awsParameterGroupCreateView',
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

        actions: [
            { text: "Delete", type: "row" }
        ],

        initialize: function(options) {
            if(options.cred_id) {
                this.credentialId = options.cred_id;
            }
            if(options.region) {
                this.region = options.region;
            }

            this.$el.html(this.template);
            this.loadData({ render: true });
            
            var cacheApp = this;
            Common.vent.on("parameterGroupAppRefresh", function() {
                cacheApp.render();
            });
            Common.vent.on("describeParameters", function(data) {
                cacheApp.addParameters(data);
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
            
            var parameterGroup = this.collection.get(this.selectedId);
            
            parameterGroup.getParameters(this.credentialId,this.region);
        },
        
        addParameters: function(parameters){
            
            $.each(parameters, function(i, parameter) {
                $("#describe_table").append("<tr><td>"+parameter.ParameterName+"</td><td>"+parameter.ParameterValue+"</td><td>"+parameter.DataType+"</td><td>"+parameter.Source+"</td><td>"+parameter.IsModifiable+"</td><td>"+parameter.Description+"</td><td>"+parameter.ApplyType+"</td><td>"+parameter.AllowedValues+"</td></tr>");
            });
        }
    });
    
    return AwsParametergroupsAppView;
});
