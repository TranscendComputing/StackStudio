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
        'text!templates/aws/vpc/awsInternetGatewayDetachTemplate.html',
        'common',
        'jquery.ui.selectmenu'
        
], function( $, _, Backbone, DialogView, internetGatewayDetachTemplate, Common ) {
    
    var InternetGatewayAttachView = DialogView.extend({

        credentialId: undefined,
        
        template: _.template(internetGatewayDetachTemplate),

        internetGateway: undefined,

        events: {
            "dialogclose": "close"
        },

        initialize: function(options) {
            this.credentialId = options.cred_id;
            this.internetGateway = options.internet_gateway;
        },

        render: function() {
            var detachView = this;
            this.$el.html(this.template);

            this.$el.dialog({
                autoOpen: true,
                title: "Detach from VPC",
                width:325,
                minHeight: 150,
                resizable: false,
                modal: true,
                buttons: {
                    Detach: function () {
                        detachView.detach();
                    },
                    Cancel: function() {
                        detachView.cancel();
                    }
                }
            });
            $("#detach_message").html("Are you sure you want to detach " +
                this.internetGateway.attributes.id + " from " + this.internetGateway.attributes.attachment_set.vpcId + "?");
        },
        
        detach: function() {
            var internetGateway = this.internetGateway;
            internetGateway.detach(this.credentialId);
            this.$el.dialog('close');
        }
    });
    
    return InternetGatewayAttachView;
});
