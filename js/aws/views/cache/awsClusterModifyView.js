/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true alert:true*/
define([
        'jquery',
        'underscore',
        'backbone',
        'views/dialogView',
        'text!templates/aws/cache/awsCacheClusterModifyTemplate.html',
        '/js/aws/models/cache/awsCacheSecurityGroup.js',
        'icanhaz',
        'common'
        
], function( $, _, Backbone, DialogView, cacheClusterModifyTemplate, SecurityGroup, ich, Common ) {
    
    /**
     * awsSecurityGroupCreateView is UI form to create compute.
     *
     * @name InstanceCreateView
     * @constructor
     * @category Compute
     * @param {Object} initialization object.
     * @returns {Object} Returns a awsSecurityGroupCreateView instance.
     */
    
    var AwsClusterModifyView = DialogView.extend({

        credentialId: undefined,

        region: undefined,
        
        modCluster: undefined,
        
        securityGroup: new SecurityGroup(),
        
        // Delegated events for creating new instances, etc.
        events: {
            "dialogclose": "close"
        },

        initialize: function(options) {
            this.credentialId = options.cred_id;
            this.region = options.region;
            this.modCluster = this.options.modCluster;
            
            var createView = this;
            var compiledTemplate = _.template(cacheClusterModifyTemplate);
            this.$el.html(compiledTemplate);

            this.$el.dialog({
                autoOpen: true,
                title: "Modify Cluster",
                resizable: false,
                width: 425,
                modal: true,
                buttons: {
                    Modify: function () {
                        createView.modify();
                    },
                    Cancel: function() {
                        createView.cancel();
                    }
                }
            });
            
            
            
        },

        render: function() {
            
            $("#node_count_input").val(this.modCluster.getNumNodes());
            
            var nodeArray = this.modCluster.getNodes();
            
            for (var i in nodeArray) {
              $("#nodes_select").append("<option value="+nodeArray[i].CacheNodeId+">"+nodeArray[i].CacheNodeId+"</option>");
            }
        },

        modify: function() {
            //alert($("#nodes_select").val());
            
            var options = {};
            var issue = false;
            
            var nodeCount = $("#node_count_input").val();
            
            //validation (check for int)
            var intRegex = /^\d+$/;
            if(intRegex.test(nodeCount) && (parseInt(nodeCount, 10) !== this.modCluster.getNumNodes())) {
                options.num_nodes = $("#node_count_input").val();
                options.apply_immediately = $("#apply_input").prop("checked");
                options.auto_minor_version_upgrade = $("#version_input").prop("checked");
                options.nodes_to_remove = $("#nodes_select").val();
            }else {
                issue = true;
            }
            
            if(!issue) {
                this.modCluster.modify(options, this.credentialId, this.region);
                this.$el.dialog('close');
            } else {
                Common.errorDialog("Invalid Request", "Please supply all required fields.");
            }
            
        }
    });
    
    return AwsClusterModifyView;
});
