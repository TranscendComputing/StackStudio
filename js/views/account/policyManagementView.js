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
        '/js/aws/collections/notification/awsTopics.js',
        '/js/aws/collections/compute/awsDefaultImages.js',
        'views/account/groupCreateView',
        'views/account/groupManageUsersView',
        '/js/aws/views/cloud_watch/awsDefaultAlarmCreateView.js',
        'jquery.dataTables',
        'jquery.dataTables.fnProcessingIndicator',
        'bootstrap'
], function( $, _, Backbone, Common, groupsManagementTemplate, Policy, Users, Topics, Images, CreateGroupView, ManageGroupUsers, CreateAlarmView ) {

    var GroupManagementView = Backbone.View.extend({

        tagName: 'div',

        template: _.template(groupsManagementTemplate),
        
        rootView: undefined,

        policy: undefined,
        
        users: undefined,
        
        topics: undefined,
        
        images: undefined,

        selectedGroup: undefined,
        
        model: undefined,
        
        alarms: [],

        events: {
            "click #manage_group_users_button" : "manageGroupUsers",
            "click #save_button" : "savePolicy",
            "click #create_alarm_btn" : "createAlarm",
            "click .remove_alarm" : "removeAlarm",
            'click #images_table tr': 'selectImage'
        },

        initialize: function() {
            this.$el.html(this.template);
            this.rootView = this.options.rootView;
            $("#submanagement_app").html(this.$el);
            //$("button").button();
            
            $("#images_table").dataTable();
            
            var groupsView = this;
            Common.vent.off("policyAppRefresh");
            Common.vent.on("policyAppRefresh", function() {
                $("#save_alert").fadeIn("slow").animate({opacity: 1.0}, 3000).fadeOut("slow");
                //refetch tree groups
                groupsView.rootView.policies.fetch({
                    data: $.param({ org_id: sessionStorage.org_id}),
                    reset: true
                });
                groupsView.refreshSession();
            });
            this.users = new Users();
            
            this.topics = new Topics();
            this.topics.on( 'reset', this.addAllTopics, this );
            
            this.images = new Images();
            this.images.on('reset', this.addAllImages, this);
            
            this.selectedGroup = undefined;
            this.render();
        },

        render: function () {
            this.addCreds();
            if(typeof this.rootView != 'undefined' && typeof this.rootView.treePolicy != 'undefined'){
                this.policy = this.rootView.treePolicy;
                this.model = this.rootView.policies.get(this.policy);
                this.populateForm(this.model);
            }
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
            o["default_alarms"] = this.alarms;
            newPolicy.save(o,this.policy,sessionStorage.org_id);
        },
        
        populateForm: function(model){
            var p = model.attributes.aws_governance;
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
                }else if(typ === "radio"){
                    $( "input[name='"+key+"'][value='"+p[key]+"']" ).attr('checked','checked');
                }else{
                    $("#"+key).val(p[key]);
                }
              }
            }
            this.alarms = p.default_alarms;
            for (var i in this.alarms){
                $("#alarm_table").append("<tr><td>"+this.alarms[i].namespace+"</td><td>"+this.alarms[i].metric_name+"</td><td>"+this.alarms[i].threshold+"</td><td>"+this.alarms[i].period+"</td><td><a class='btn btn-mini btn-danger remove_alarm'><i class='icon-minus-sign icon-white'></i></a></td></tr>");
            }
        },
        
        refreshSession: function(){
            var url = Common.apiUrl + "/identity/v1/accounts/auth/" + sessionStorage.account_id;
            
            $.ajax({
                url: url,
                type: 'GET',
                contentType: 'application/x-www-form-urlencoded',
                success: function(data) {
                    sessionStorage.group_policies = JSON.stringify(data.account.group_policies);
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            });
        },
        
        createAlarm: function(){
            var pView = this;
            var topicsList = [$("#default_informational").val(),$("#default_warning").val(),$("#default_error").val()];
            var newAlarmDialog = new CreateAlarmView({cred_id: $("#default_credentials").val(), region: $("#default_region").val(), policy_view: pView,tList: topicsList});
            newAlarmDialog.render();
        },
        
        addCreds: function(){
            var creds = JSON.parse(sessionStorage.cloud_credentials);
            $("#default_credentials").empty();
            for (var i in creds) {
                $("#default_credentials").append("<option value='"+creds[i].cloud_credential.id+"'>"+creds[i].cloud_credential.name+"</option>");
            }
            this.topics.fetch({ data: $.param({ cred_id: $("#default_credentials").val(), region: $("#default_region").val()}), reset: true });
            this.images.fetch({ data: $.param({ cred_id: $("#default_credentials").val(), region: $("#default_region").val()}), reset: true });
        },
        
        addAlarm: function(options){
            //debugger
            this.alarms.push(options);
            $("#alarm_table").append("<tr><td>"+options.namespace+"</td><td>"+options.metric_name+"</td><td>"+options.threshold+"</td><td>"+options.period+"</td><td><a class='btn btn-mini btn-danger remove_alarm'><i class='icon-minus-sign icon-white'></i></a></td></tr>");
        },
        
        removeAlarm: function(event){
            var tr = $(event.target).closest('tr');
            tr.css("background-color","#FF3700");
            tr.fadeOut(400, function(){
                tr.remove();
            });
            var trIndex = tr.prevAll().length;
            this.alarms.splice(trIndex,1);
            return false;
        },
        
        addAllTopics: function(collection){
            $("#default_informational").empty();
            $("#default_warning").empty();
            $("#default_error").empty();
            collection.each(function(model){
                $("#default_informational").append("<option>"+model.attributes.id+"</option>");
                $("#default_warning").append("<option>"+model.attributes.id+"</option>");
                $("#default_error").append("<option>"+model.attributes.id+"</option>");
            });
            if(typeof this.rootView != 'undefined' && typeof this.rootView.treePolicy != 'undefined'){
                var p = this.model.attributes.aws_governance;
                $("#default_informational").val(p.default_informational);
                $("#default_warning").val(p.default_warning);
                $("#default_error").val(p.default_error);
            }
        },
        
        addAllImages: function(collection){
            $("#images_table").dataTable().fnClearTable();
            collection.each(function(model) {
                var rowData = [model.attributes.label];
                $("#images_table").dataTable().fnAddData(rowData);
            });
        },
        
        selectImage: function(event){
            $(".row_selected").removeClass('row_selected');
            $(event.currentTarget).addClass('row_selected');
        },

        close: function(){
            this.$el.remove();
        }  
    });

    return GroupManagementView;
});