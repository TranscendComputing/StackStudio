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
/*global define:true console:true alert:true*/
define([
        'jquery',
        'underscore',
        'backbone',
        'views/dialogView',
        'text!templates/topstack/dns/topstackHostedZoneCreateTemplate.html',
        '/js/topstack/models/dns/topstackHostedZone.js',
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
