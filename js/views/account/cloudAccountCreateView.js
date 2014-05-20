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
        'collections/clouds',
        'models/cloudAccount',
        'common'
        
], function( $, _, Backbone, DialogView, cloudAccountCreateTemplate, Clouds, CloudAccount, Common ) {
    
    var CloudAccountCreateView = DialogView.extend({

        cloudAccount: new CloudAccount(),
        
        org_id: undefined,
        
        clouds: Clouds,

        parentView : undefined,

        onCreated: undefined,
        
        events: {
            "dialogclose": "close",
            "change #cloud_select": "cloudSelect"
        },

        initialize: function ( options ) {
            this.parentView = options.rootView;
            this.org_id = options.org_id;
            var self = this;
            
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

            //make sure other events have been bound first
            setTimeout(function () {
                if(self.parentView.afterSubAppRender) {
                    self.parentView.afterSubAppRender(self);
                }
            }, 5);
        },

        render: function() {
            this.clouds.on('reset', this.addClouds, this);
            this.clouds.fetch({ 
                reset: true
            });
            $("#org_html").html(sessionStorage.company);
        },

        create: function() {
            var newCloudAccount = this.cloudAccount;
            var options = {};
            var issue = false;
            
            if($("#cloud_account_name_input").val() !== "") {
                this.displayValid(true, "#cloud_account_name_input");
                options.name = $("#cloud_account_name_input").val();
            }else{
                issue = true;
                this.displayValid(false, "#cloud_account_name_input");
            }
            
            //if OpenStack is Chosen, ensure URL is submitted
            if(($("#cloud_select").val() === "51bb825dd39097439c0000f6") && ($("#auth_url_input").val() !== "")) {
                this.displayValid(true, "#auth_url_input");
                options.url = $("#auth_url_input").val();
                
                //hardcode authurl
                /*
                options.url = "";
                options.protocol = "";
                options.host = "";
                options.port = "";*/
                
            }else if($("#cloud_select").val() !== "51bb825dd39097439c0000f6"){
                //no url if not openstack
            }else{
                issue = true;
                this.displayValid(false, "#auth_url_input");
            }
            
            if(!issue){
                newCloudAccount.create(options,sessionStorage.org_id,sessionStorage.login,$("#cloud_select").val());
                this.$el.dialog('close');

            }else{
                Common.errorDialog("Invalid Request", "Please supply all required fields.");
            }

            if(this.onCreated) {
                this.onCreated();
            }
        },
        
        cloudSelect: function(event){
            //show auth url box if OpenStack is chosen
            if(event.target.value === "51bb825dd39097439c0000f6"){
                $("#auth_url_row").show();
            }else{
                $("#auth_url_row").hide();
            }
        },
        
        displayValid: function(valid, selector) {
            if(valid) {
                $(selector).css("border-color", "");
            }else{
                $(selector).css("border-color", "#FF0000");
            }
        },
        
        addClouds: function(){
            
            $("#cloud_select").empty();
            this.clouds.each(function(cloud) {
                $("#cloud_select").append("<option value="+cloud.attributes.id+">"+cloud.attributes.name+"</option>");
            });
        }
    });
    
    return CloudAccountCreateView;
});
