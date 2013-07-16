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
        'text!templates/account/cloudAccountCreateTemplate.html',
        '/js/collections/clouds.js',
        '/js/models/cloudAccount.js',
        'common'
        
], function( $, _, Backbone, DialogView, cloudAccountCreateTemplate, Clouds, CloudAccount, Common ) {
    
    var CloudAccountCreateView = DialogView.extend({

        cloudAccount: new CloudAccount(),
        
        org_id: undefined,
        
        clouds: Clouds,
        
        events: {
            "dialogclose": "close"
        },

        initialize: function(options) {
            this.org_id = options.org_id;
            
            var createView = this;
            var compiledTemplate = _.template(cloudAccountCreateTemplate);
            this.$el.html(compiledTemplate);

            this.$el.dialog({
                autoOpen: true,
                title: "Create Cloud Account",
                resizable: false,
                width: 325,
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

        render: function() {
            $("#org_select").selectmenu();
            $("#cloud_select").selectmenu();
            
            this.clouds.on('reset', this.addClouds, this);
            this.clouds.fetch({ 
                reset: true
            });
            $("#org_html").html(sessionStorage.company);
        },

        create: function() {
            var newCloudAccount = this.cloudAccount;
            var options = {};
            
            if($("#cloud_account_name_input").val() !== "") {
                options.name = $("#cloud_account_name_input").val();
                newCloudAccount.create(options,sessionStorage.org_id,$("#cloud_select").val());
                this.$el.dialog('close');
            }else {
                Common.errorDialog("Invalid Request", "Please supply all required fields.");
            }
        },
        
        addClouds: function(){
            
            $("#cloud_select").empty();
            this.clouds.each(function(cloud) {
                $("#cloud_select").append("<option value="+cloud.attributes.id+">"+cloud.attributes.name+"</option>");
            });
            $("#cloud_select").selectmenu();
        }
    });
    
    return CloudAccountCreateView;
});
