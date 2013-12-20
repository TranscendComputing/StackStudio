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
        'text!templates/account/policyManagementTemplateOS.html',
        'models/policy',
        'collections/users',
        '/js/aws/collections/notification/awsTopics.js',
        '/js/aws/collections/compute/awsDefaultImages.js',
        '/js/openstack/collections/compute/openstackImages.js',
        '/js/aws/collections/vpc/awsVpcs.js',
        '/js/aws/collections/vpc/awsSubnets.js',
        'views/account/groupCreateView',
        'views/account/groupManageUsersView',
        '/js/aws/views/cloud_watch/awsDefaultAlarmCreateView.js',
        '/js/aws/views/notification/awsTopicsCreateView.js',
        '/js/aws/views/vpc/awsVpcCreateView.js',
        '/js/aws/views/vpc/awsSubnetCreateView.js',
        'spinner',
        'jquery.dataTables',
        'jquery.dataTables.fnProcessingIndicator',
        'bootstrap'
], function( $, _, Backbone, Common, groupsManagementTemplate, groupsManagementTemplateOS, Policy, Users, Topics, Images, ImagesOS, Vpcs, Subnets, CreateGroupView, ManageGroupUsers, CreateAlarmView, CreateTopicsView, CreateVpcsView, CreateSubnetView, Spinner ) {

    var GroupManagementView = Backbone.View.extend({

        tagName: 'div',

        template_os: _.template(groupsManagementTemplateOS),

        template: _.template(groupsManagementTemplate),
        
        rootView: undefined,

        policy: undefined,
        
        users: undefined,
        
        topics: undefined,
        
        images: undefined,

        images_os: undefined,
        
        vpcs: undefined,
        
        subnets: undefined,

        selectedGroup: undefined,
        
        model: undefined,
        
        alarms: [],
        
        default_images: [],

        default_images_os: [],

        events: {
            "click #manage_group_users_button" : "manageGroupUsers",
            "click #save_button" : "savePolicy",
            "click #create_alarm_btn" : "createAlarm",
            "click #add_image_btn" : "addImage",
            "click .remove_alarm" : "removeAlarm",
            "click .remove_image" : "removeImage",
            'click .images-list tr': 'clickImage',
            "change .image_filter":"imageFilterSelect",
            "change .default_credentials":"changeCreds",
            "click .create_topic_btn":"topicCreate",
            "click .create_vpc_btn":"vpcCreate",
            "click .create_subnet_btn":"subnetCreate",
            'change input[type=checkbox]': 'checkboxChanged',
            'click #project_name': 'pnFocus',
            'click .cloud-button' : 'clickCloudButton',
            'click .cloud-tab' : 'clickCloudTab'
        },

        initialize: function() {
            this.$el.html(this.template);
            this.rootView = this.options.rootView;
            $("#submanagement_app").html(this.$el);
            $("#content_os").html(this.template_os);            
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
                    ],
                "oLanguage": {
                        "sEmptyTable": "No images have been added."
                      }
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

            this.images_os = new ImagesOS();
            this.images_os.on('reset', this.addAllImagesOS, this);
            
            this.vpcs = new Vpcs();
            this.vpcs.on('reset', this.addAllVpcs, this);
            
            this.subnets = new Subnets();
            this.subnets.on('reset', this.addAllSubnets, this);
            
            this.selectedGroup = undefined;
            this.render();
        },

        render: function () {
            $("#gov_page").hide().show("slow");
            this.addCreds();
            if(typeof this.rootView !== 'undefined' && typeof this.rootView.treePolicy !== 'undefined'){
                this.policy = this.rootView.treePolicy;
                this.model = this.rootView.policies.get(this.policy);
                this.populateForm(this.model);
            }else{
                this.prePopForm();
            }
            this.disableSelectionRequiredButtons(false);
            
            var spinnerOptions = {
                //lines: 13, // The number of lines to draw
                length: 10, // The length of each line
                width: 8, // The line thickness
                radius: 5, // The radius of the inner circle
                corners: 1, // Corner roundness (0..1)
                rotate: 0, // The rotation offset
                color: '#000', // #rgb or #rrggbb
                speed: 1, // Rounds per second
                trail: 60, // Afterglow percentage
                shadow: false, // Whether to render a shadow
                hwaccel: false, // Whether to use hardware acceleration
                className: 'spinner', // The CSS class to assign to the spinner
                zIndex: 2e9 // The z-index (defaults to 2000000000)
                //top: 150, // Top position relative to parent in px
                //left: 211 // Left position relative to parent in px
            };
            
            new Spinner(spinnerOptions).spin($("#images_table").get(0));
        },
        
        treeSelect: function() {
            this.clearSelection();
            this.render();
            $("#aws_button").removeClass("active");
            $("#os_button").removeClass("active");
            $("#content").hide("fast");
            $("#content_os").hide("fast");
            $("#os_tab_item").hide("fast");
            $("#aws_tab_item").hide("fast");

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
            
            var o = this.populateSavedHash("#content form");
            var oS = this.populateSavedHash("#content_os form");
            var pW = this.populateSavedHash("#content_org form");
            newPolicy.save($("#policy_name").val(),o,oS,pW,this.policy,sessionStorage.org_id);
        },
        populateSavedHash: function(form_name){
            var o = {};
            var a = $(form_name).serializeArray();
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
        
            if(form_name === "#content form")
            {
                o["default_alarms"] = this.alarms;
                o["default_images"] = this.default_images;
            }
            if(form_name === "#content_os form")
            {
                o["default_alarms"] = this.alarms;
                o["default_images"] = this.default_images_os;
            }
            return o;
        },
        populateFormOS: function(p){
            for (var key in p) {
              if (p.hasOwnProperty(key)) {    
                var typ = $( "input[name='"+key+"']" ).prop("type");
                if(typ === "checkbox"){
                    if(typeof p[key] === 'string'){
                        $( "input[name='"+key+"'][value='"+p[key]+"']" ).attr('checked','checked');
                    }else{
                        for (var i in p[key]) {
                          $( "input[name='"+key+"'][value='"+p[key][i]+"']" ).attr('checked','checked');
                        }
                    }
                }else if(typ === "radio"){
                    $( "input[name='"+key+"'][value='"+p[key]+"']" ).attr('checked','checked');
                }else{
                    $("#"+key+"_os").val(p[key]);
                }
              }
            }

            this.alarms = p.default_alarms;
            for (var j in this.alarms){
                $("#alarm_table").append("<tr><td>"+this.alarms[j].namespace+"</td><td>"+this.alarms[j].metric_name+"</td><td>"+this.alarms[j].threshold+"</td><td>"+this.alarms[j].period+"</td><td><a class='btn btn-mini btn-danger remove_alarm'><i class='icon-minus-sign icon-white'></i></a></td></tr>");
            } 
            if(this.model.attributes.os_governance.default_images)
            {
                $("#default_images_table_os").dataTable().fnClearTable();
                this.default_images_os = this.model.attributes.os_governance.default_images;

                for(var k in this.default_images_os){
                    $('input[name=use_approved_images]').attr('checked', true);
                    $("#default_images_table_os").dataTable().fnAddData([this.default_images_os[k]["name"],this.default_images_os[k]["id"],"<a class='btn btn-mini btn-danger remove_image'><i class='icon-minus-sign icon-white'></i></a>"]);
                }
            }
        },
        populateFormPW: function(p){
            for (var key in p) {
              if (p.hasOwnProperty(key)) {    
                var typ = $( "input[name='"+key+"']" ).prop("type");
                if(typ === "checkbox"){
                    if(typeof p[key] === 'string'){
                        $( "input[name='"+key+"'][value='"+p[key]+"']" ).attr('checked','checked');
                    }else{
                        for (var i in p[key]) {
                          $( "input[name='"+key+"'][value='"+p[key][i]+"']" ).attr('checked','checked');
                        }
                    }
                }else if(typ === "radio"){
                    $( "input[name='"+key+"'][value='"+p[key]+"']" ).attr('checked','checked');
                }else{
                    $("#"+key+"_pw").val(p[key]);
                }
              }
            }
        },
        populateForm: function(model){
            $('input:checkbox').removeAttr('checked');
            $("#policy_name").val(model.attributes.name);
            var p = model.attributes.aws_governance;

            for (var key in p) {
              if (p.hasOwnProperty(key)) {
                var typ = $( "input[name='"+key+"']" ).prop("type");
                if(typ === "checkbox"){
                    if(typeof p[key] === 'string'){
                        $( "input[name='"+key+"'][value='"+p[key]+"']" ).attr('checked','checked');
                    }else{
                        for (var i in p[key]) {
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
            for (var j in this.alarms){
                $("#alarm_table").append("<tr><td>"+this.alarms[j].namespace+"</td><td>"+this.alarms[j].metric_name+"</td><td>"+this.alarms[j].threshold+"</td><td>"+this.alarms[j].period+"</td><td><a class='btn btn-mini btn-danger remove_alarm'><i class='icon-minus-sign icon-white'></i></a></td></tr>");
            }
            if(this.model.attributes.aws_governance.default_images)
            {
                $("#default_images_table").dataTable().fnClearTable();
                this.default_images = this.model.attributes.aws_governance.default_images;
                for(var k in this.default_images){
                    $('input[name=use_approved_images]').attr('checked', true);
                    $("#default_images_table").dataTable().fnAddData([this.default_images[k]["name"],this.default_images[k]["id"],"<a class='btn btn-mini btn-danger remove_image'><i class='icon-minus-sign icon-white'></i></a>"]);
                }
            }
            this.populateFormOS(model.attributes.os_governance);
            this.populateFormPW(model.attributes.org_governance);
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
            $("#default_credentials_os").empty();

            for (var i in creds) {
                if(creds[i].cloud_credential.cloud_provider === "AWS"){
                    $("#default_credentials").append("<option value='"+creds[i].cloud_credential.id+"'>"+creds[i].cloud_credential.name+"</option>");
                }
                else if(creds[i].cloud_credential.cloud_provider === "OpenStack"){
                    $("#default_credentials_os").append("<option value='"+creds[i].cloud_credential.id+"'>"+creds[i].cloud_credential.name+"</option>");
                }

            }

            if(typeof this.rootView !== 'undefined' && typeof this.rootView.treePolicy !== 'undefined'){
                var tp = this.rootView.policies.get(this.rootView.treePolicy);
                $("#default_credentials").val(tp.attributes.aws_governance.default_credentials);
                $("#default_credentials_os").val(tp.attributes.os_governance.default_credentials);
            }
            if($("#default_credentials").length > 0){
                $("#whole_form").show("slow");
                $("#cred_message").hide("slow");
                this.topics.fetch({ data: $.param({ cred_id: $("#default_credentials").val(), region: $("#default_region").val()}), reset: true });
                this.images.fetch({ data: $.param({ cred_id: $("#default_credentials").val(), region: $("#default_region").val(), platform: $("#filter_platform").val()}), reset: true });
                this.vpcs.fetch({ data: $.param({ cred_id: $("#default_credentials").val(), region: $("#default_region").val()}), reset: true });
                this.subnets.fetch({ data: $.param({ cred_id: $("#default_credentials").val(), region: $("#default_region").val()}), reset: true });
            }
            if($("#default_credentials_os").length > 0){
                $("#whole_form_os").show("slow");
                $("#cred_message_os").hide("slow");
                this.images_os.fetch({ data: $.param({ cred_id: $("#default_credentials_os").val(), region: $("#default_region_os").val()}), reset: true });
            }
        },

        changeCreds: function(event){
            this.addCredDependent();
        },

        addCredDependent: function(){
            this.topics.fetch({ data: $.param({ cred_id: $("#default_credentials").val(), region: $("#default_region").val()}), reset: true });
            this.images.fetch({ data: $.param({ cred_id: $("#default_credentials").val(), region: $("#default_region").val(), platform: $("#filter_platform").val()}), reset: true });
            this.images_os.fetch({ data: $.param({ cred_id: $("#default_credentials_os").val(), region: $("#default_region_os").val()}), reset: true });
            this.vpcs.fetch({ data: $.param({ cred_id: $("#default_credentials").val(), region: $("#default_region").val()}), reset: true });
            this.subnets.fetch({ data: $.param({ cred_id: $("#default_credentials").val(), region: $("#default_region").val()}), reset: true });
        },
        
        addAlarm: function(options){
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
            var defaults = [];
            var tr = $(event.target).closest('tr');
            tr.css("background-color","#FF3700");
            tr.fadeOut(400, function(){
                tr.remove();
            });
            var trIndex = tr.prevAll().length;
            if($(event.target).parents('table').attr('id') === "default_images_table"){
                defaults = this.default_images;
            }
            if($(event.target).parents('table').attr('id') === "default_images_table_os"){
                defaults = this.default_images_os;
            }
            defaults.splice(trIndex,1);
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
            
            if(typeof this.rootView !== 'undefined' && typeof this.rootView.treePolicy !== 'undefined'){
                var p = this.model.attributes.aws_governance;
                $("#default_informational").val(p.default_informational);
                $("#default_warning").val(p.default_warning);
                $("#default_error").val(p.default_error);
            }
        },
        
        addAllImages: function(collection){
            $(".spinner").remove();
            $("#images_table").dataTable().fnClearTable();
            collection.each(function(model) {
                var rowData = [model.attributes.imageId,model.attributes.imageLocation,model.attributes.architecture];
                $("#images_table").dataTable().fnAddData(rowData);
            });
        },

        addAllImagesOS: function(collection){
            //$(".spinner").remove();
            $("#images_table_os").dataTable().fnClearTable();
            collection.each(function(model) {
                var rowData = [model.attributes.name,model.attributes.id,model.attributes.status];
                $("#images_table_os").dataTable().fnAddData(rowData);
            });
        },      
        
        addAllVpcs: function(collection){
            $("#default_vpc").empty();
            collection.each(function(model) {
                $("#default_vpc").append("<option>"+model.attributes.id+"</option>");
            });
            if(typeof this.rootView !== 'undefined' && typeof this.rootView.treePolicy !== 'undefined'){
                var p = this.model.attributes.aws_governance;
                $("#default_vpc").val(p.default_vpc);
            }
        },
        
        addAllSubnets: function(collection){
            $("#default_subnet").empty();
            collection.each(function(model) {
                $("#default_subnet").append("<option>"+model.attributes.subnet_id+"</option>");
            });
            if(typeof this.rootView !== 'undefined' && typeof this.rootView.treePolicy !== 'undefined'){
                var p = this.model.attributes.aws_governance;
                $("#default_subnet").val(p.default_subnet);
            }    
        },

        clickImage: function(event){
            if($(event.target).parents('table').attr('id') === "images_table"){
                this.selectImage("",event.currentTarget);
            }
            if($(event.target).parents('table').attr('id') === "images_table_os"){
                this.selectImage("_os",event.currentTarget);
            }
        },
        
        selectImage: function(provider,target){
            $(".row_selected").removeClass('row_selected');
            $(target).addClass('row_selected');
            
            var rowData = $("#images_table"+provider).dataTable().fnGetData(target);
            
            // $("#add_image").hide();
//             $("#add_image_source").hide();
            
            // $("#add_image").show(1000);
//             $("#add_image_source").show(1000);
            this.addImage(provider,rowData[0],rowData[1]);
        },
        
        imageFilterSelect: function(event){
            //$("#images_table").dataTable().fnClearTable();
            
            var spinnerOptions = {
                //lines: 13, // The number of lines to draw
                length: 50, // The length of each line
                width: 16, // The line thickness
                radius: 50, // The radius of the inner circle
                corners: 1, // Corner roundness (0..1)
                rotate: 0, // The rotation offset
                color: '#000', // #rgb or #rrggbb
                speed: 1, // Rounds per second
                trail: 60, // Afterglow percentage
                shadow: false, // Whether to render a shadow
                hwaccel: false, // Whether to use hardware acceleration
                className: 'spinner', // The CSS class to assign to the spinner
                zIndex: 2e9 // The z-index (defaults to 2000000000)
                //top: 150, Top position relative to parent in px
                //left: 211 Left position relative to parent in px
            };
            
            new Spinner(spinnerOptions).spin($("#images_table").get(0));
            
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
        
        addImage: function(provider,image,image_id){
            var defaults = [];
            if(provider === ""){
                defaults = this.default_images;
            }
            else if (provider === "_os"){
                defaults = this.default_images_os;
            }
            defaults.push({"name": image ,"id": image_id});
            $("#default_images_table"+provider).dataTable().fnAddData([image,image_id,"<a class='btn btn-mini btn-danger remove_image'><i class='icon-minus-sign icon-white'></i></a>"]);
            $('input[name=use_approved_images'+provider+']').attr('checked', true);
        },
        
        saveImages: function(){
            var cells = [];
            var rows = $("#default_images_table").dataTable().fnGetNodes();
            for(var i=0;i<rows.length;i++)
            {
                var row = {"name" : $(rows[i]).find("td:eq(0)").html(), "id" : $(rows[i]).find("td:eq(1)").html()};
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
            case "project_name_toggle":
                this.disablePNInput($("#project_name"),!$("#"+lambda.target.id).is(':checked'));
                break;
            case "check_max_on_demand_os":
                this.disableInput($("#max_on_demand_os"),$("#"+lambda.target.id).is(':checked'));
                break;
            case "check_max_in_autoscale_os":
                this.disableInput($("#max_in_autoscale_os"),$("#"+lambda.target.id).is(':checked'));
                break;
            case "check_rds_os":
                this.disableInput($("#max_rds_os"),$("#"+lambda.target.id).is(':checked'));
                break;
            case "check_max_volumes_os":
                this.disableInput($("#max_volumes_os"),$("#"+lambda.target.id).is(':checked'));
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
        
        disablePNInput: function(target,toggle){
            if(toggle === true && !target.is(":focus")){
                //$("#project_name_toggle").prop('checked', false);
                target.attr("disabled", true);
                target.addClass("ui-state-disabled");
                target.val("");
            }else{
                //$("#project_name_toggle").prop('checked', false);
                target.removeAttr("disabled");
                target.removeClass("ui-state-disabled");
            }
        },
        
        pnFocus: function(event){
            if(event.target.id === "project_name"){
                $("#project_name_toggle").prop("checked", false);//.prop('checked', true);
            }
        },

        clickCloudTab: function(event){
            $(".tab-selector.active").removeClass("active");
            if(event.target.id === "tab_os"){
                $("#content").hide("slow");
                $("#content_os").show("slow");
                $("#os_tab_item").addClass("active");

            }
            if(event.target.id === "tab_aws"){
                $("#content").show("slow");
                $("#content_os").hide("slow");  
                $("#aws_tab_item").addClass("active");
            }
            
        },
        buttonBehavior: function(nav)
        {
                var button = $("."+nav+".cloud-button");
                var tab = $("."+nav+".tab-selector");
                var content = $("."+nav+".cont");

                button.toggleClass("active");
                tab.toggle();
                if(! button.hasClass("active")){
                    content.hide("slow");
                    if($(".cloud-button").hasClass("active")){
                        $(".tab-selector:visible").first().addClass("active");
                        tab.removeClass("active");
                        var data_cloud = $(".tab-selector:visible").first().attr("data-cloud");
                        $(".cont." + data_cloud).show("slow");
                    }
                }
                if(tab.is(':visible') && button.hasClass("active")){
                    $(".tab-selector").removeClass("active");
                    $(".cont").hide("slow");
                    tab.addClass("active");
                    content.show("slow");
                }
                if($(".cloud-button").hasClass("active")){
                    $("#clouds_select_msg").hide();
                }
                else{
                    $("#clouds_select_msg").show();
                    $(".content").hide("slow");
                }
        },

        clickCloudButton: function(event){
            if(event.target.id === "os_button" || event.target.id === "os_img"){
                this.buttonBehavior("os");
            }
            if(event.target.id === "aws_button" || event.target.id === "aws_img"){
                this.buttonBehavior("aws");
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