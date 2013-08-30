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
        'text!templates/account/policyCreateTemplate.html',
        'models/policy',
        'icanhaz',
        'common',
        'jquery.multiselect'
        
], function( $, _, Backbone, DialogView, networkCreateTemplate, Policy, ich, Common ) {
    
    /**
     * googleNetworkCreateView is UI form to create compute.
     *
     * @name NetworkCreateView
     * @constructor
     * @category Compute
     * @param {Object} initialization object.
     * @returns {Object} Returns a googleNetworkCreateView network.
     */
    
    var GoogleNetworkCreateView = DialogView.extend({

        credentialId: undefined,

        region: undefined,
        
        policy: new Policy(),
        
        // Delegated events for creating new networks, etc.
        events: {
            "dialogclose": "close",
            'change input[type=checkbox]': 'checkboxChanged'
        },

        initialize: function(options) {
            //this.credentialId = options.cred_id;
            //this.region = options.region;
            var createView = this;
            var compiledTemplate = _.template(networkCreateTemplate);
            this.$el.html(compiledTemplate);

            this.$el.dialog({
                autoOpen: true,
                title: "Create Policy",
                resizable: false,
                width: 512,
                modal: true,
                buttons: {
                    Save: function () {
                        createView.create();
                    },
                    Cancel: function() {
                        createView.cancel();
                    }
                }
            });
            $("#accordion").accordion({ heightStyle: "content" });
            $("#usable_clouds_select").multiselect({
                selectedList: 3,
                noneSelectedText: "Select Allowed Cloud(s)"
            });
            $("#usable_regions_select").multiselect({
                selectedList: 3,
                noneSelectedText: "Select Allowed Region(s)"
            });
            $("#enabled_services_select").multiselect({
                selectedList: 3,
                noneSelectedText: "Select Allowed Service(s)"
            });
        },

        render: function() {
            
        },
        
        checkboxChanged: function(lambda){
            switch(lambda.target.id)
            {
            case "check1":
                this.disableSelect($("#usable_clouds_select"),$("#"+lambda.target.id).is(':checked'));
                break;
            case "check2":
                this.disableSelect($("#usable_regions_select"),$("#"+lambda.target.id).is(':checked'));
                break;
            case "check3":
                this.disableInput($("#max_inst"),$("#"+lambda.target.id).is(':checked'));
                break;
            case "check4":
                this.disableInput($("#max_core"),$("#"+lambda.target.id).is(':checked'));
                break;
            }
        },
        
        disableSelect: function(target,toggle){
            if(toggle === true){
                target.multiselect('disable');
            }else{
                target.multiselect('enable');
            }
        },
        
        disableInput: function(target,toggle){
            if(toggle === true){
                target.attr("disabled", true);
                target.addClass("ui-state-disabled");
            }else{
                target.removeAttr("disabled");
                target.removeClass("ui-state-disabled");
            }
        },
        
        create: function() {
            var newPolicy = this.policy;
            var plcy = {};
            
            var issue = false;
            
            if($("#name_input").val() !== "" ) {
                plcy.network_name = $("#name_input").val();
            }else {
                issue = true;
            }
            
            if($("#iprange_input").val() !== "" ) {
                plcy.ip_range = $("#iprange_input").val();
            }else {
                issue = true;
            }
            
            if(!issue) {
                newPolicy.create(plcy, this.credentialId);
                this.$el.dialog('close');
            } else {
                Common.errorDialog("Invalid Request", "Please supply all required fields.");
            }
        }
    });
    
    return GoogleNetworkCreateView;
});
