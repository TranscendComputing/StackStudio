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
        'text!templates/topstack/cache/topstackCacheClusterModifyTemplate.html',
        'icanhaz',
        'common'
        
], function( $, _, Backbone, DialogView, cacheClusterModifyTemplate, ich, Common ) {

    var TopStackClusterModifyView = DialogView.extend({

        credentialId: undefined,

        region: undefined,
        
        modCluster: undefined,

        events: {
            "dialogclose": "close"
        },

        render: function() {
            var modifyView = this;
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
                        modifyView.modify();
                    },
                    Cancel: function() {
                        modifyView.cancel();
                    }
                }
            });
            
            $("#node_count_input").val(this.modCluster.getNumNodes());
            
            var nodeArray = this.modCluster.getNodes();
            
            for (var i in nodeArray) {
              $("#nodes_select").append("<option value="+nodeArray[i].CacheNodeId+">"+nodeArray[i].CacheNodeId+"</option>");
            }
        },

        modify: function() {     
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
    
    return TopStackClusterModifyView;
});
