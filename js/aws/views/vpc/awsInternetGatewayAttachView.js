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
        'text!templates/aws/vpc/awsInternetGatewayAttachTemplate.html',
        'aws/collections/vpc/awsVpcs',
        'common'
        
], function( $, _, Backbone, DialogView, internetGatewayAttachTemplate, Vpcs, Common ) {
    
    var InternetGatewayAttachView = DialogView.extend({

        credentialId: undefined,

        region: undefined,
        
        template: _.template(internetGatewayAttachTemplate),

        vpcs: new Vpcs(),

        internetGateway: undefined,

        events: {
            "dialogclose": "close"
        },

        initialize: function(options) {
            this.credentialId = options.cred_id;
            this.region = options.region;
            this.internetGateway = options.internet_gateway;
        },

        render: function() {
            var attachView = this;
            this.$el.html(this.template);

            this.$el.dialog({
                autoOpen: true,
                title: "Attach to VPC",
                width:400,
                minHeight: 150,
                resizable: false,
                modal: true,
                buttons: {
                    Attach: function () {
                        attachView.attach();
                    },
                    Cancel: function() {
                        attachView.cancel();
                    }
                }
            });
            this.vpcs.on('reset', this.addAllVpcs, this);
            this.vpcs.fetch({ data: $.param({ cred_id: this.credentialId, region: this.region }), reset: true });
        },

        addAllVpcs: function() {
            $("#vpc_select").empty();
            this.vpcs.each(function(vpc) {
                $("#vpc_select").append($("<option value=" + vpc.attributes.id + ">" + vpc.attributes.id + "</option>"));
            });
        },
        
        attach: function() {
            var internetGateway = this.internetGateway;
            var options = {};
            var issue = false;

            if($("#vpc_select").val() != null && $("#vpc_select").val() !== "") {
                options.vpc_id = $("#vpc_select").val();
            }

            if(!issue) {
                internetGateway.attach(options, this.credentialId, this.region);
                this.$el.dialog('close');
            }else {
                Common.errorDialog("Invalid Request", "Please supply all required fields.");
            }
        }

    });
    
    return InternetGatewayAttachView;
});
