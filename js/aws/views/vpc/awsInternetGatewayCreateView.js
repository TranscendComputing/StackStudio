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
        'text!templates/aws/vpc/awsInternetGatewayCreateTemplate.html',
        '/js/aws/models/vpc/awsInternetGateway.js',
        'common'
], function( $, _, Backbone, DialogView, internetGatewayCreateTemplate, InternetGateway, Common ) {
	
	var InternetGatewayCreateView = DialogView.extend({

        credentialId: undefined,

        region: undefined,

		template: _.template(internetGatewayCreateTemplate),

        internetGateway: new InternetGateway(),

		events: {
			"dialogclose": "close"
		},

		initialize: function(options) {
            this.credentialId = options.cred_id;
            this.region = options.region;
        },

		render: function() {
			var createView = this;
            this.$el.html(this.template);

            this.$el.dialog({
                autoOpen: true,
                title: "Create Internet Gateway",
                width:400,
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
		},
		
		create: function() {
			var internetGateway = this.internetGateway;
            internetGateway.create(this.credentialId, this.region);
			this.$el.dialog('close');
		}

	});
    
	return InternetGatewayCreateView;
});
