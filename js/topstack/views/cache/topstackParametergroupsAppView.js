/*!
 * (c) Copyright 2012-2013 Transcend Computing, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an AS IS BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
        'views/resource/resourceAppView',
        'text!templates/topstack/cache/topstackParameterGroupAppTemplate.html',
        '/js/topstack/models/cache/topstackCacheParameterGroup.js',
        '/js/topstack/collections/cache/topstackCacheParameterGroups.js',
        'icanhaz',
        'common',
        'jquery.dataTables'
], function( $, _, Backbone, ResourceAppView, cacheParametersAppTemplate, CacheParameterGroup, CacheParameterGroups, ich, Common ) {
    'use strict';

    var TopStackParametergroupsAppView = ResourceAppView.extend({
        
        template: _.template(cacheParametersAppTemplate),
        
        modelStringIdentifier: "id",
        
        columns: ["id", "family", "description"],
        
        idColumnNumber: 0,
        
        model: CacheParameterGroup,
        
        collectionType: CacheParameterGroups,
        
        type: "cache",
        
        subtype: "parametergroups",
        
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
    
    return TopStackParametergroupsAppView;
});
