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
        'text!templates/account/policyManagementTemplate.html',
        'models/policy',
        'collections/users',
        'views/account/groupCreateView',
        'views/account/groupManageUsersView',
        'jquery.dataTables',
        'jquery.dataTables.fnProcessingIndicator',
        'bootstrap'
], function( $, _, Backbone, Common, groupsManagementTemplate, Policy, Users, CreateGroupView, ManageGroupUsers ) {

    var GroupManagementView = Backbone.View.extend({

        tagName: 'div',

        template: _.template(groupsManagementTemplate),
        
        rootView: undefined,

        policy: undefined,
        
        users: undefined,

        selectedGroup: undefined,
        
        model: undefined,

        events: {
            "click #manage_group_users_button" : "manageGroupUsers",
            "click #save_button" : "savePolicy"
        },

        initialize: function() {
            this.$el.html(this.template);
            this.rootView = this.options.rootView;
            $("#submanagement_app").html(this.$el);
            //$("button").button();
            $("#group_users_table").dataTable({
                "bJQueryUI": true,
                "bProcessing": true
            });
            var groupsView = this;
            Common.vent.off("groupRefresh");
            Common.vent.on("groupRefresh", function() {
                groupsView.render();
                //refetch tree groups
                
            });
            this.users = new Users();
            this.selectedGroup = undefined;
            
            this.render();
        },

        render: function () {
            this.policy = this.rootView.treePolicy;
            this.model = this.rootView.policies.get(this.policy);
            this.populateForm(this.model);
            
            this.disableSelectionRequiredButtons(false);
        },
        
        treeSelect: function() {
            this.clearSelection();
            this.render();
        },

        disableSelectionRequiredButtons: function(toggle) {
            
            if(toggle) {
                $("#delete_group_button").attr("disabled", true);
                $("#delete_group_button").addClass("ui-state-disabled");
                $("#delete_group_button").removeClass("ui-state-hover");
                $("#manage_group_users_button").attr("disabled", true);
                $("#manage_group_users_button").addClass("ui-state-disabled");
            }else {
                $("#delete_group_button").removeAttr("disabled");
                $("#delete_group_button").removeClass("ui-state-disabled");
                $("#manage_group_users_button").removeAttr("disabled");
                $("#manage_group_users_button").removeClass("ui-state-disabled");
            }
            
            //check admin
            this.adminCheck();
            
        },
        
        adminCheck: function(){
            var groupsView = this;
            groupsView.users.fetch({success: function(){
                var isAdmin = false;
                if(groupsView.users.get(sessionStorage.account_id).attributes.permissions.length > 0){
                    isAdmin = groupsView.users.get(sessionStorage.account_id).attributes.permissions[0].permission.name === "admin";
                }
                if(!isAdmin){
                    $("#delete_group_button").attr("disabled", true);
                    $("#delete_group_button").addClass("ui-state-disabled");
                    $("#delete_group_button").removeClass("ui-state-hover");
                    $("#manage_group_users_button").attr("disabled", true);
                    $("#manage_group_users_button").addClass("ui-state-disabled");
                }
            }});
        },
        
        manageGroupUsers: function() {
            if(this.selectedGroup) {
                new ManageGroupUsers({group_id: this.selectedGroup.attributes.id});
            }else {
                Common.errorDialog("Error", "Group is not selected.");
            }
        },

        clearSelection: function() {
            this.selectedGroup = undefined;
            $(".group_item").removeClass("selected_item");
        },
        
        savePolicy: function(){
            var newPolicy = new Policy();
            
            var o = {};
            var a = $("form").serializeArray();
            $.each(a, function() {
                if (o[this.name]) {
                    if (!o[this.name].push) {
                        o[this.name] = [o[this.name]];
                    }
                    o[this.name].push(this.value || '');
                } else {
                    o[this.name] = this.value || '';
                }
            });
            
            newPolicy.save(o,this.policy,sessionStorage.org_id);
        },
        
        populateForm: function(model){
            var p = model.attributes.aws_governance;
            console.log(p);
            for (var key in p) {
              if (p.hasOwnProperty(key)) {
                var typ = $( "input[name='"+key+"']" ).prop("type");
                if(typ === "checkbox"){
                    if(typeof p[key] === 'string'){
                        $( "input[name='"+key+"'][value='"+p[key]+"']" ).attr('checked','checked');
                    }else{
                        for (i in p[key]) {
                          $( "input[name='"+key+"'][value='"+p[key][i]+"']" ).attr('checked','checked');
                        }
                    }
                }else{
                    $("#"+key).val(p[key]);
                }
              }
            }
        },

        close: function(){
            this.$el.remove();
        }  
    });

    return GroupManagementView;
});