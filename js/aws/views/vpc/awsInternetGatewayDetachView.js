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
        'views/dialogView',
        'text!templates/aws/vpc/awsInternetGatewayDetachTemplate.html',
        'common',
        'jquery.ui.selectmenu'
        
], function( $, _, Backbone, DialogView, internetGatewayDetachTemplate, Common ) {
    
    var InternetGatewayAttachView = DialogView.extend({

        credentialId: undefined,

        region: undefined,
        
        template: _.template(internetGatewayDetachTemplate),

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
            internetGateway.detach(this.credentialId, this.region);
            this.$el.dialog('close');
        }
    });
    
    return InternetGatewayAttachView;
});
