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
        'text!templates/openstack/compute/openstackKeyPairImportTemplate.html',
        '/js/openstack/models/compute/openstackKeyPair.js',
        'icanhaz',
        'common'
        
], function( $, _, Backbone, DialogView, keyPairImportTemplate, KeyPair, ich, Common ) {
    
    var OpenstackKeyPairImportView = DialogView.extend({
        
        credentialId: undefined,

        region: undefined,
        
        keyPair: new KeyPair(),
        
        events: {
            "dialogclose": "close",
            "change #keypair_file": "changeFile"
        },

        initialize: function(options) {
            this.credentialId = options.cred_id;
            this.region = options.region;
            var importView = this;
            var compiledTemplate = _.template(keyPairImportTemplate);
            this.$el.html(compiledTemplate);

            this.$el.dialog({
                autoOpen: true,
                title: "Import Key Pair",
                width:350,
                resizable: false,
                modal: true,
                buttons: {
                    Import: function () {
                        importView.importKey();
                    },
                    Cancel: function() {
                        importView.cancel();
                    }
                }
            });
        },

        render: function() {
            
        },
        changeFile: function(e){
            var file = e.target.files[0];
            var reader = new FileReader();
              // Closure to capture the file information.
              reader.onload = (function(theFile) {
                return function(e) {
                  $("#public_key").val(e.target.result);
                };
              })(file);
              reader.readAsText(file);
        },
        importKey: function(e) {
            var params = {};
            var issue = $("#keypair_name").val() === "" || $("#public_key").val() === "";
            if(!issue){
                params["name"] = $("#keypair_name").val();
                params["public_key"] = $("#public_key").val();
                $.ajax({
                    url: Common.apiUrl + "/stackstudio/v1/cloud_management/openstack/compute/key_pairs/import?cred_id=" + this.credentialId + "&region=" + this.region,
                    data: JSON.stringify({"key_pair":params}),
                    type: "POST",
                    contentType: 'application/x-www-form-urlencoded',
                    success: function(){
                        Common.vent.trigger("keyPairAppRefresh");
                    },
                    error: function(jqXHR) {
                        Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                    }
                });
                Common.vent.once("keyPairAppRefresh", _.bind(function(){
                    this.$el.dialog('close');
                }, this));
            }
            else{
                Common.errorDialog("Invalid Request", "Please supply all required fields.");
            }
        }

    });
    
    return OpenstackKeyPairImportView;
});
