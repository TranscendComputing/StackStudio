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
        'views/dialogView',
        'text!templates/aws/vpc/awsNetworkAclCreateTemplate.html',
        'aws/collections/vpc/awsVpcs',
        'aws/models/vpc/awsNetworkAcl',
        'icanhaz',
        'common',
        'jquery.multiselect',
        'jquery.multiselect.filter'
        
], function( $, _, Backbone, DialogView, networkAclCreateTemplate, Vpcs, NetworkAcl, ich, Common ) {
            
    /**
     * NetworkAclCreateView is UI form to create compute.
     *
     * @name NetworkAclCreateView
     * @constructor
     * @category NetworkAcl
     * @param {Object} initialization object.
     * @returns {Object} Returns a NetworkAclCreateView instance.
     */
    
    var NetworkAclCreateView = DialogView.extend({

        credentialId: undefined,

        region: undefined,

        vpcs: new Vpcs(),

        networkAcl: new NetworkAcl(),

        template: _.template(networkAclCreateTemplate),

        // Delegated events for creating new instances, etc.
        events: {
            "dialogclose": "close"
        },

        initialize: function(options) {
            //TODO
            this.credentialId = options.cred_id;
            this.region = options.region;
        },

        render: function() {
            var createView = this;
            this.$el.html(this.template);

            this.$el.dialog({
                autoOpen: true,
                title: "Create Network Acl",
                width:500,
                minHeight: 150,
                resizable: false,
                modal: true,
                buttons: {
                    Create: function () {
                        createView.create();
                    },
                    Cancel: function() {
                        createView.cancel();
                    }
                }
                
            });
           
            this.vpcs.on( 'reset', this.addAllVpcs, this );
            this.vpcs.fetch({ data: $.param({ cred_id: this.credentialId, region: this.region }), reset: true });
        },
        
        addAllVpcs: function() {
            $("#vpc_select").empty();
            this.vpcs.each(function(vpc) {
                $("#vpc_select").append($("<option value=" + vpc.attributes.id + ">" + vpc.attributes.id + "</option>"));
            });
        },

        create: function() {
            var networkAcl = this.networkAcl;
            var options = {};
            var issue = false;

            //Validate and create
            if($("#vpc_select").val !== null && $("#vpc_select").val() !== "") {
                options.vpc_id = $("#vpc_select").val();
            }else {
                issue = true;
            }

            if(!issue) {
                networkAcl.create(options, this.credentialId, this.region);
                this.$el.dialog('close');
            }else {
                Common.errorDialog("Invalid Request", "Please supply all required fields.");
            }
        }

    });
    
    return NetworkAclCreateView;
});
