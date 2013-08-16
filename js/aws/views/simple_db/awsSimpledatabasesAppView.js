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
        'views/resource/resourceRowView',
        'text!templates/aws/simple_db/awsSimpleDBAppTemplate.html',
        '/js/aws/models/simple_db/awsSimpleDatabase.js',
        '/js/aws/collections/simple_db/awsSimpleDatabases.js',
        '/js/aws/views/simple_db/awsSimpleDatabaseCreateView.js',
        'icanhaz',
        'common'
], function( $, _, Backbone, ResourceAppView, ResourceRowView, awsSimpleDBAppTemplate, SimpleDB, SimpleDBs, AwsSimpleDBCreate, ich, Common ) {
    'use strict';

    var AwsSimpleDBAppView = ResourceAppView.extend({

        template: _.template(awsSimpleDBAppTemplate),

        modelStringIdentifier: "DomainName",

        columns: ["DomainName"],
        
        idColumnNumber: 0,
        
        model: SimpleDB,
        
        collectionType: SimpleDBs,

        type: "simple_db",
        
        subtype: "simpledatabases",

        CreateView: AwsSimpleDBCreate,
        
        events: {
            'click .create_button': 'createNew',
            'click #action_menu ul li': 'performAction',
            'click #resource_table tr': "clickOne"
        },

        initialize: function(options) {
            if(options.cred_id) {
                this.credentialId = options.cred_id;
            }
            if(options.region) {
                this.region = options.region;
            }
            this.render();
            
            var simpleDBApp = this;
            Common.vent.on("simpleDBAppRefresh", function() {
                simpleDBApp.render();
            });
        },

        toggleActions: function(e) {
            //Disable any needed actions
        },
        
        performAction: function(event) {
            var simpleDb = this.collection.get(this.selectedId);
            
            switch(event.target.text)
            {
                case "Delete Domain":
                    simpleDb.destroy(this.credentialId, this.region);
                    break;
            }
        }
    });
    
    return AwsSimpleDBAppView;
});
