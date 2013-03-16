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
        'text!templates/aws/dns/awsRecordSetCreateTemplate.html',
        '/js/aws/models/dns/awsRecordSet.js',
        'common',
        'jquery.ui.selectmenu'
        
], function( $, _, Backbone, DialogView, recordSetCreateTemplate, RecordSet, Common ) {
    
    var AwsRecordSetCreateView = DialogView.extend({

        credentialId: undefined,
        
        recordSet: new RecordSet(),

        hostedZone: undefined,

        previousRecordSet: undefined,
        
        events: {
            "dialogclose": "close"
        },

        initialize: function(options) {
            this.credentialId = options.cred_id;
            this.hostedZone = options.hosted_zone;
            this.previousRecordSet = options.record_set;
            var dialogTitle = "Create Record Set";
            if(this.previousRecordSet) {
                dialogTitle = "Edit Record Set";
            }
            var createView = this;
            var compiledTemplate = _.template(recordSetCreateTemplate);
            this.$el.html(compiledTemplate);

            this.$el.dialog({
                autoOpen: true,
                title: dialogTitle,
                resizable: false,
                width: 550,
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
            $("#record_type_select").selectmenu({
                change: function() {
                    createView.updateExample();
                }
            });
            $("#hosted_zone_domain").html(this.hostedZone.attributes.domain);
        },

        render: function() {
            
        },

        updateExample: function() {
            switch($("#record_type_select").val())
            {
                case "A":
                    $("#record_value_example").html("IPv4 address. Enter multiple addresses on separate lines. <br />" +
                                                    "Example: <br />" +
                                                    "&nbsp;&nbsp;192.0.2.235 <br />" +
                                                    "&nbsp;&nbsp;198.51.100.234");
                    break;
                case "CNAME":
                    $("#record_value_example").html("The domain name that you want to resolve to instead of the value in the Name field. <br />" +
                                                    "Example: <br />" +
                                                    "&nbsp;&nbsp;www.example.com");
                    break;
                case "MX":
                    $("#record_value_example").html("A priority and a domain name that specifies a mail server. Enter multiple values on separate lines. <br />" +
                                                    "Format: <br />" +
                                                    "&nbsp;&nbsp;[priority] [mail server host name] <br />" +
                                                    "Example: <br />" +
                                                    "&nbsp;&nbsp;10 mailserver.example.com. <br />" +
                                                    "&nbsp;&nbsp;20 mailserver2.example.com.");
                    break;
                case "AAAA":
                    $("#record_value_example").html("IPv6 address. Enter multiple addresses on separate lines. <br />" +
                                                    "Example: <br />" +
                                                    "&nbsp;&nbsp;2001:0db8:85a3:0:0:8a2e:0370:7334  <br />" +
                                                    "&nbsp;&nbsp;fe80:0:0:0:202:b3ff:fe1e:8329");
                    break;
                case "TXT":
                    $("#record_value_example").html("A text record. Enter multiple values on separate lines. Enclose text in quotation marks. <br />" +
                                                    "Example: <br />" +
                                                    "&nbsp;&nbsp;\"Sample Text Entries\"  <br />" +
                                                    "&nbsp;&nbsp;\"Enclose entries in quotation marks\"");
                    break;
                case "PTR":
                    $("#record_value_example").html("The domain name that you want to return. <br />" +
                                                    "Example: <br />" +
                                                    "&nbsp;&nbsp;www.example.com");
                    break;
                case "SRV":
                    $("#record_value_example").html("An SRV record. For information about SRV record format, refer to the applicable documentation. Enter multiple values on separate lines. <br />" +
                                                    "Format: <br />" +
                                                    "&nbsp;&nbsp;[priority] [weight] [port] [server host name] <br />" +
                                                    "Example: <br />" +
                                                    "&nbsp;&nbsp;1 10 5269 xmpp-server.example.com. <br />" +
                                                    "&nbsp;&nbsp;2 12 5060 sip-server.example.com.");
                    break;
                case "SPF":
                    $("#record_value_example").html("An SPF record. For information about SPF record format, refer to the applicable documentation. Enter multiple values on separate lines. Enclose values in quotation marks. <br />" +
                                                    "Example: <br />" +
                                                    "&nbsp;&nbsp;\"v=spf1 ip4:192.168.0.1/16-all\"");
                    break;
                case "NS":
                    $("#record_value_example").html("The domain name of a name server. Enter multiple name servers on separate lines. <br />" +
                                                    "Example: <br />" +
                                                    "&nbsp;&nbsp;ns1.amazon.com <br />" +
                                                    "&nbsp;&nbsp;ns2.amazon.org <br />" +
                                                    "&nbsp;&nbsp;ns3.amazon.net <br />" +
                                                    "&nbsp;&nbsp;ns4.amazon.co.uk");
                    break;
            }
        },

        create: function() {
            var newRecordSet = this.recordSet;
            var options = {};
            var issue = false;

            options.hosted_zone_id = this.hostedZone.attributes.id;
            options.change_batch = [];
            var change = {};
            change["action"] = 'CREATE';
            if($("#record_name_input").val() != "") {
                var nameInput = $("#record_name_input").val();
                if(nameInput.substr(nameInput.length - 1) === ".") {
                    change["name"] = nameInput + this.hostedZone.attributes.domain;
                }else {
                    change["name"] = nameInput + "." + this.hostedZone.attributes.domain;
                }
            }else {
                issue = true;
            }

            change["type"] = $("#record_type_select").val();

            if($("#record_ttl_input").val() != "") {
                change["ttl"] = $("#record_ttl_input").val();
            }

            if($("#record_value_input").val() != "") {
                change["resource_records"] = [];
                var values = $("#record_value_input").val().split("\n");
                $.each(values, function(index, value) {
                    change["resource_records"].push(value);
                });
            }else {
                issue = true;
            }
            options.change_batch.push(change);
            if(!issue) {
                newRecordSet.change(options, this.credentialId);
                this.$el.dialog('close');
            } else {
                Common.errorDialog("Invalid Request", "Please supply all required fields.");
            }
        }

    });
    
    return AwsRecordSetCreateView;
});
