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
        'text!templates/aws/beanstalk/awsApplicationAppTemplate.html',
        '/js/aws/models/beanstalk/awsApplication.js',
        '/js/aws/collections/beanstalk/awsApplications.js',
        '/js/aws/views/cache/awsSecurityGroupCreateView.js',
        'icanhaz',
        'common',
        'jquery.dataTables'
], function( $, _, Backbone, FeatureNotImplementedView, ResourceAppView, awsApplicationAppTemplate, Application, Applications, AwsSecurityGroupCreate, ich, Common ) {
    'use strict';

    var AwsBeanstalkAppView = ResourceAppView.extend({

        template: _.template(awsApplicationAppTemplate),
        
        modelStringIdentifier: "name",
        
        columns: ["name", "created_at", "updated_at"],
        
        idColumnNumber: 0,
        
        model: Application,
        
        collectionType: Applications,
        
        type: "beanstalk",
        
        subtype: "applications",
        
        CreateView: AwsSecurityGroupCreate,
        
        events: {
            'click .create_button': 'createNew',
            'click #action_menu ul li': 'performAction',
            'click #resource_table tr': 'clickOne',
            'change #version_select': 'selectVersion'
        },

        initialize: function(options) {
            if(options.cred_id) {
                this.credentialId = options.cred_id;
            }
            if(options.region) {
                this.region = options.region;
            }
            
            this.render();
            
            var applicationApp = this;
            Common.vent.on("applicationAppRefresh", function() {
                applicationApp.render();
            });
        },
        
        /*
        render: function() {
            var featureNotImplemented = new FeatureNotImplementedView({feature_url: "https://github.com/TranscendComputing/StackStudio/issues/8", element: "#resource_app"});
            featureNotImplemented.render();
        },*/
        
        toggleActions: function(e) {
            //Disable any needed actions
        },
        
        performAction: function(event) {
            var application = this.collection.get(this.selectedId);

            switch(event.target.text)
            {
            case "Delete Application":
                application.destroy(this.credentialId, this.region);
                break;
            }
        },
        
        selectVersion: function(e){
            $("#version_detail").append("These are the version details.");
        }
    });
    
    return AwsBeanstalkAppView;
});
