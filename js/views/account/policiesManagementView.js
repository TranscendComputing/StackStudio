/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true requirejs:true require:true*/
define([
        'jquery',
        'underscore',
        'backbone',
        'common',
        'text!templates/account/policiesManagementTemplate.html',
        'collections/policies',
        // 'views/account/policyCreateView',
        'jquery.dataTables',
        'jquery.dataTables.fnProcessingIndicator'
], function( $, _, Backbone, Common, policiesManagementTemplate, Policies ) {

    var PolicyManagementView = Backbone.View.extend({

        tagName: 'div',

        template: _.template(policiesManagementTemplate),

        policies: undefined,

        selectedPolicy: undefined,
        
        rootView: undefined,

        events: {
            "click #users_table tr": "selectPolicy",
            "click #create_user_button": "createPolicy",
            "click #delete_user_button": "deletePolicy"
        },

        initialize: function() {
            this.$el.html(this.template);
            this.rootView = this.options.rootView;
            $("#submanagement_app").html(this.$el);
            $("button").button();
            $("#users_table").dataTable({
                "bJQueryUI": true,
                "bProcessing": true
            });
            var view = this;
            Common.vent.on("policyAppRefresh", function() {
                view.render();
            });
            
            this.policies = new Policies();
            this.policies.on('reset', this.addAllPolicies, this);
            this.rootView.policies = this.policies;
            this.render();
        },

        render: function () {
            $("#users_table").dataTable().fnProcessingIndicator(true);
            this.policies.fetch({
                data: $.param({ org_id: Common.account.org_id }),
                reset: true
            });
            this.disableDeleteButton(true);
        },

        addAllPolicies: function() {
            var view = this;
            $("#users_table").dataTable().fnClearTable();
            this.policies.each(function ( policy ) {
                var rowData = [policy.attributes.name];
                $("#users_table").dataTable().fnAddData(rowData);
            });
            $("#users_table").dataTable().fnProcessingIndicator(false);
        },

        selectPolicy: function(event) {
            this.clearSelection();
            $(event.currentTarget).addClass("row_selected");
            var rowData = $("#users_table").dataTable().fnGetData(event.currentTarget);
            var view = this;
            this.policies.each(function ( policy ) {
                if(policy.attributes.name === rowData[0]) {
                    view.selectedPolicy = policy;
                    view.disableDeleteButton(false);
                }
            });
        },

        disableDeleteButton: function(toggle) {
            if(toggle) {
                $("#delete_user_button").attr("disabled", true);
                $("#delete_user_button").addClass("ui-state-disabled");
            }else {
                $("#delete_user_button").removeAttr("disabled");
                $("#delete_user_button").removeClass("ui-state-disabled");
            }
        },
        /*
        disableCreateButton: function() {
            var isAdmin = false;
            if(this.policies.get(Common.account.id).attributes.permissions.length > 0){
                isAdmin = this.policies.get(Common.account.id).attributes.permissions[0].permission.name === "admin";
            }
            if(!isAdmin){
                $("#create_user_button").attr("disabled", true);
                $("#create_user_button").addClass("ui-state-disabled");
            }
        },*/

        createPolicy: function() {
            location.href = "#account/management/policy";
        },

        deletePolicy: function() {
            if(this.selectedPolicy) {
                this.selectedPolicy.destroy();
            }
        },

        clearSelection: function() {
            $("#users_table tr").removeClass("row_selected");
        },

        close: function(){
            this.$el.remove();
        }  
    });

    return PolicyManagementView;
});
