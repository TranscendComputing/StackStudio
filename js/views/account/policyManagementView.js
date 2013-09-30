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
        '/js/aws/collections/vpc/awsVpcs.js',
        '/js/aws/collections/vpc/awsSubnets.js',
        'views/account/groupCreateView',
        'views/account/groupManageUsersView',
        '/js/aws/views/cloud_watch/awsDefaultAlarmCreateView.js',
        '/js/aws/views/notification/awsTopicsCreateView.js',
        '/js/aws/views/vpc/awsVpcCreateView.js',
        '/js/aws/views/vpc/awsSubnetCreateView.js',
        'jquery.dataTables',
        'jquery.dataTables.fnProcessingIndicator',
        'bootstrap'
], function( $, _, Backbone, Common, groupsManagementTemplate, Policy, Users, Topics, Images, Vpcs, Subnets, CreateGroupView, ManageGroupUsers, CreateAlarmView, CreateTopicsView, CreateVpcsView, CreateSubnetView ) {

    var GroupManagementView = Backbone.View.extend({

        tagName: 'div',

        template: _.template(groupsManagementTemplate),
        
        rootView: undefined,

        policy: undefined,
        
        users: undefined,
        
        topics: undefined,
        
        images: undefined,
        
        vpcs: undefined,
        
        subnets: undefined,

        selectedGroup: undefined,
        
        model: undefined,
        
        alarms: [],
        
        default_images: [],

        events: {
            "click #manage_group_users_button" : "manageGroupUsers",
            "click #save_button" : "savePolicy",
            "click #create_alarm_btn" : "createAlarm",
            "click #add_image_btn" : "addImage",
            "click .remove_alarm" : "removeAlarm",
            "click .remove_image" : "removeImage",
            'click #images_table tr': 'selectImage',
            "change .image_filter":"imageFilterSelect",
            "change .default_credentials":"changeCreds",
            "click .create_topic_btn":"topicCreate",
            "click .create_vpc_btn":"vpcCreate",
            "click .create_subnet_btn":"subnetCreate",
            'change input[type=checkbox]': 'checkboxChanged'
        },

        initialize: function() {
            this.$el.html(this.template);
            this.rootView = this.options.rootView;
            $("#submanagement_app").html(this.$el);
            //$("button").button();
            
            $("#images_table").dataTable({
                "aoColumns": [
                        { "sWidth": "25%" },
                        { "sWidth": "50%" },
                        { "sWidth": "25%" }
                    ]
            });
            $("#default_images_table").dataTable({
                "sDom": 't',
                "aoColumns": [
                        { "sWidth": "20%" },
                        { "sWidth": "75%" },
                        { "sWidth": "5%" }
                    ]
            });
            
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
            
            Common.vent.off("topicAppRefresh");
            Common.vent.on("topicAppRefresh", function() {
                groupsView.topics.fetch({ data: $.param({ cred_id: $("#default_credentials").val(), region: $("#default_region").val()}), reset: true });
            });
            Common.vent.off("vpcAppRefresh");
            Common.vent.on("vpcAppRefresh", function() {
                groupsView.vpcs.fetch({ data: $.param({ cred_id: $("#default_credentials").val(), region: $("#default_region").val()}), reset: true });
            });
            Common.vent.off("subnetAppRefresh");
            Common.vent.on("subnetAppRefresh", function() {
                groupsView.subnets.fetch({ data: $.param({ cred_id: $("#default_credentials").val(), region: $("#default_region").val()}), reset: true });
            });
            
            this.users = new Users();
            
            this.topics = new Topics();
            this.topics.on( 'reset', this.addAllTopics, this );
            
            this.images = new Images();
            this.images.on('reset', this.addAllImages, this);
            
            this.vpcs = new Vpcs();
            this.vpcs.on('reset', this.addAllVpcs, this);
            
            this.subnets = new Subnets();
            this.subnets.on('reset', this.addAllSubnets, this);
            
            this.selectedGroup = undefined;
            this.render();
        },

        render: function () {
            this.addCreds();
            if(typeof this.rootView != 'undefined' && typeof this.rootView.treePolicy != 'undefined'){
                this.policy = this.rootView.treePolicy;
                this.model = this.rootView.policies.get(this.policy);
                this.populateForm(this.model);
            }else{
                this.prePopForm();
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
            o["default_images"] = this.default_images;
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
            this.default_images = this.model.attributes.aws_governance.default_images;
            for(var i in this.default_images){
                $("#default_images_table").dataTable().fnAddData([this.default_images[i]["image_id"],this.default_images[i]["source"],"<a class='btn btn-mini btn-danger remove_image'><i class='icon-minus-sign icon-white'></i></a>"]);
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
            
            var topicsList = [];
            if($("#default_informational").val() !== "None"){topicsList.push($("#default_informational").val());}
            if($("#default_warning").val() !== "None"){topicsList.push($("#default_warning").val());}
            if($("#default_error").val() !== "None"){topicsList.push($("#default_error").val());}
            
            var newAlarmDialog = new CreateAlarmView({cred_id: $("#default_credentials").val(), region: $("#default_region").val(), policy_view: pView,tList: topicsList});
            newAlarmDialog.render();
        },
        
        addCreds: function(){
            var creds = JSON.parse(sessionStorage.cloud_credentials);
            $("#default_credentials").empty();
            for (var i in creds) {
                if(creds[i].cloud_credential.cloud_provider === "AWS"){
                    $("#default_credentials").append("<option value='"+creds[i].cloud_credential.id+"'>"+creds[i].cloud_credential.name+"</option>");
                }
            }

            if(typeof this.rootView != 'undefined' && typeof this.rootView.treePolicy != 'undefined'){
                var tp = this.rootView.policies.get(this.rootView.treePolicy);
                $("#default_credentials").val(tp.attributes.aws_governance.default_credentials);
            }
            if(creds.length > 0){
                
                $("#whole_form").show("slow");
                $("#cred_message").hide("slow");
                this.topics.fetch({ data: $.param({ cred_id: $("#default_credentials").val(), region: $("#default_region").val()}), reset: true });
                this.images.fetch({ data: $.param({ cred_id: $("#default_credentials").val(), region: $("#default_region").val(), platform: $("#filter_platform").val()}), reset: true });
                this.vpcs.fetch({ data: $.param({ cred_id: $("#default_credentials").val(), region: $("#default_region").val()}), reset: true });
                this.subnets.fetch({ data: $.param({ cred_id: $("#default_credentials").val(), region: $("#default_region").val()}), reset: true });
            }
        },

        changeCreds: function(event){
            this.addCredDependent();
        },

        addCredDependent: function(){
            //debugger
            this.topics.fetch({ data: $.param({ cred_id: $("#default_credentials").val(), region: $("#default_region").val()}), reset: true });
            this.images.fetch({ data: $.param({ cred_id: $("#default_credentials").val(), region: $("#default_region").val(), platform: $("#filter_platform").val()}), reset: true });
            this.vpcs.fetch({ data: $.param({ cred_id: $("#default_credentials").val(), region: $("#default_region").val()}), reset: true });
            this.subnets.fetch({ data: $.param({ cred_id: $("#default_credentials").val(), region: $("#default_region").val()}), reset: true });
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
        
        removeImage: function(event){
            var tr = $(event.target).closest('tr');
            tr.css("background-color","#FF3700");
            tr.fadeOut(400, function(){
                tr.remove();
            });
            var trIndex = tr.prevAll().length;
            this.default_images.splice(trIndex,1);
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
            
            $("#default_informational").append("<option>None</option>");
            $("#default_warning").append("<option>None</option>");
            $("#default_error").append("<option>None</option>");
            
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
                var rowData = [model.attributes.imageId,model.attributes.imageLocation,model.attributes.architecture];
                $("#images_table").dataTable().fnAddData(rowData);
            });
        },
        
        addAllVpcs: function(collection){
            $("#default_vpc").empty();
            collection.each(function(model) {
                $("#default_vpc").append("<option>"+model.attributes.id+"</option>");
            });
            if(typeof this.rootView != 'undefined' && typeof this.rootView.treePolicy != 'undefined'){
                var p = this.model.attributes.aws_governance;
                $("#default_vpc").val(p.default_vpc);
            }
        },
        
        addAllSubnets: function(collection){
            $("#default_subnet").empty();
            collection.each(function(model) {
                $("#default_subnet").append("<option>"+model.attributes.subnet_id+"</option>");
            });
            if(typeof this.rootView != 'undefined' && typeof this.rootView.treePolicy != 'undefined'){
                var p = this.model.attributes.aws_governance;
                $("#default_subnet").val(p.default_subnet);
            }
        },
        
        selectImage: function(event){
            $(".row_selected").removeClass('row_selected');
            $(event.currentTarget).addClass('row_selected');
            
            var rowData = $("#images_table").dataTable().fnGetData(event.currentTarget);
            
            $("#add_image").hide();
            $("#add_image_source").hide();
            
            $("#add_image").html(rowData[0]);
            $("#add_image_source").html(rowData[1]);
            
            $("#add_image").show(1000);
            $("#add_image_source").show(1000);
        },
        
        imageFilterSelect: function(event){
            $("#images_table").dataTable().fnClearTable();
            this.images.fetch({ data: $.param({ cred_id: $("#default_credentials").val(), region: $("#default_region").val(), platform: $("#filter_platform").val()}), reset: true });
        },
        
        topicCreate: function(event){
            var createTopicsDialog = new CreateTopicsView({cred_id: $("#default_credentials").val(), region: $("#default_region").val()});
            createTopicsDialog.render();
        },
        
        vpcCreate: function(event){
            var createVPCsDialog = new CreateVpcsView({cred_id: $("#default_credentials").val(), region: $("#default_region").val()});
            createVPCsDialog.render();
        },
        
        subnetCreate: function(event){
            var createSubnetDialog = new CreateSubnetView({cred_id: $("#default_credentials").val(), region: $("#default_region").val()});
            createSubnetDialog.render();
        },
        
        addImage: function(){
            this.default_images.push({"image_id" : $("#add_image").html(),"source": $("#add_image_source").html()});
            $("#default_images_table").dataTable().fnAddData([$("#add_image").html(),$("#add_image_source").html(),"<a class='btn btn-mini btn-danger remove_image'><i class='icon-minus-sign icon-white'></i></a>"]);
        },
        
        saveImages: function(){
            var cells = [];
            var rows = $("#default_images_table").dataTable().fnGetNodes();
            for(var i=0;i<rows.length;i++)
            {
                var row = {"image_id" : $(rows[i]).find("td:eq(0)").html(), "source" : $(rows[i]).find("td:eq(1)").html()};
                // Get HTML of 3rd column (for example)
                cells.push(row); 
            }
            return cells;
        },
        
        checkboxChanged: function(lambda){
            switch(lambda.target.id)
            {
            case "check_rds":
                this.disableInput($("#max_rds"),$("#"+lambda.target.id).is(':checked'));
                break;
            case "check_max_on_demand":
                this.disableInput($("#max_on_demand"),$("#"+lambda.target.id).is(':checked'));
                break;
            case "check_max_reserved":
                this.disableInput($("#max_reserved"),$("#"+lambda.target.id).is(':checked'));
                break;
            case "check_max_dedicated":
                this.disableInput($("#max_dedicated"),$("#"+lambda.target.id).is(':checked'));
                break;
            case "check_max_spot":
                this.disableInput($("#max_spot"),$("#"+lambda.target.id).is(':checked'));
                break;
            case "check_max_in_autoscale":
                this.disableInput($("#max_in_autoscale"),$("#"+lambda.target.id).is(':checked'));
                break;
            }
        },
        
        disableInput: function(target,toggle){
            if(toggle === true){
                target.attr("disabled", true);
                target.addClass("ui-state-disabled");
                target.val("");
            }else{
                target.removeAttr("disabled");
                target.removeClass("ui-state-disabled");
            }
        },
        
        prePopForm: function(){
            $("input:checkbox[name='usable_regions']").each(function(){
                $(this).prop('checked', true);
            });
            $("input:checkbox").each(function(){
                $(this).prop('checked', true);
            });
        },
        
        close: function(){
            this.$el.remove();
        }  
    });

    return GroupManagementView;
});