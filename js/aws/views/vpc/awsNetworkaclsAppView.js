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
        'text!templates/aws/vpc/awsNetworkAclAppTemplate.html',
        'aws/models/vpc/awsNetworkAcl',
        'aws/collections/vpc/awsNetworkAcls',
        'aws/views/vpc/awsNetworkAclCreateView',
        'views/featureNotImplementedDialogView',
        'icanhaz',
        'common',
        'jquery.dataTables'
], function( $, _, Backbone, AppView, awsNetworkAclAppTemplate, NetworkAcl, NetworkAcls, awsNetworkAclCreateView, FeatureNotImplementedDialogView, ich, Common ) {
    'use strict';

    // Aws NetworkAcl Application View
    // ------------------------------

    /**
     * AwsNetworkAclAppView is UI view list of cloud Network Acls.
     *
     * @name NetworkAclAppView
     * @constructor
     * @category Resources
     * @param {Object} initialization object.
     * @returns {Object} Returns a AwsNetworkAclsAppView instance.
     */
    var AwsNetworkAclsAppView = AppView.extend({
        template: _.template(awsNetworkAclAppTemplate),
        
        modelStringIdentifier: "network_acl_id",

        model: NetworkAcl,

        idColumnNumber: 0,
        
        columns: ["network_acl_id", "vpc_id", "default"],
        
        collectionType: NetworkAcls,
        
        type: "vpc",
        
        subtype: "networkacls",
        
        CreateView: awsNetworkAclCreateView,
        
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
            
            
            var networkAclApp = this;
            Common.vent.on("networkAclAppRefresh", function() {
                networkAclApp.render();
            });
            this.render();
        },

        toggleActions: function(e) {
            //Disable any needed actions
            this.networkAcl = this.collection.get(this.selectedId);
        },

        toggleButton: function(target, toggle){
            if(toggle === true){
                target.attr("disabled", true);
                target.addClass("ui-state-disabled");
            }else{
                target.removeAttr("disabled");
                target.removeClass("ui-state-disabled");
            }
        },

        performAction: function(event) {
            var networkAcl = this.networkAcl;
            
            switch(event.target.text)
            {
            case "Delete":
                networkAcl.destroy(this.credentialId, this.region);
                break;
            }
        }

    });
    
    return AwsNetworkAclsAppView;
});
