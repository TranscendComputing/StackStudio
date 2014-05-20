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
        'text!templates/topstack/dns/topstackHostedZoneCreateTemplate.html',
        'topstack/models/dns/topstackHostedZone',
        'common'
        
], function( $, _, Backbone, DialogView, hostedZoneCreateTemplate, HostedZone, Common ) {
    
    var TopStackHostedZoneCreateView = DialogView.extend({

        credentialId: undefined,
        
        hostedZone: new HostedZone(),
        
        events: {
            "dialogclose": "close"
        },

        render: function() {
            var createView = this;
            var compiledTemplate = _.template(hostedZoneCreateTemplate);
            this.$el.html(compiledTemplate);

            this.$el.dialog({
                autoOpen: true,
                title: "Create Hosted Zone",
                resizable: false,
                width: 500,
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
            var newHostedZone = this.hostedZone;
            var options = {};
            var issue = false;
            
            if($("#domain_name_input").val() !== "") {
                options.domain = $("#domain_name_input").val();
            }else {
                issue = true;
            }

            if($("#comment_input").val() !== "") {
                options.description = $("#comment_input").val();
            }
            
            if(!issue) {
                newHostedZone.create(options, this.credentialId);
                this.$el.dialog('close');
            } else {
                Common.errorDialog("Invalid Request", "Please supply all required fields.");
            }
        }

    });
    
    return TopStackHostedZoneCreateView;
});
