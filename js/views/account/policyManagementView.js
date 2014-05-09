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
            'click .enabled-cloud': 'clickCloudEnable',
            'click .cloud-button' : 'clickCloudButton',
            'click .cloud-tab' : 'clickCloudTab'
        },

        initialize: function() {
            this.$el.html(this.template);
            this.rootView = this.options.rootView;
            $("#submanagement_app").html(this.$el);
            $("#content_os").html(this.template_os);
            $("#images_table_aws").dataTable({
                "aoColumns": [
                        { "sWidth": "25%" },
                        { "sWidth": "50%" },
                        { "sWidth": "25%" }
                    ]
            });
            $("#default_images_table_aws").dataTable({
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
                groupsView.topics.fetch({ data: $.param({ cred_id: $("#default_credentials_aws").val(), region: $("#default_region_aws").val()}), reset: true });
            });
            Common.vent.off("vpcAppRefresh");
            Common.vent.on("vpcAppRefresh", function() {
                groupsView.vpcs.fetch({ data: $.param({ cred_id: $("#default_credentials_aws").val(), region: $("#default_region_aws").val()}), reset: true });
            });
            Common.vent.off("subnetAppRefresh");
            Common.vent.on("subnetAppRefresh", function() {
                groupsView.subnets.fetch({ data: $.param({ cred_id: $("#default_credentials_aws").val(), region: $("#default_region_aws").val()}), reset: true });
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

            if(this.rootView.afterSubAppRender) {
                this.rootView.afterSubAppRender(this);
            }
        },

        render: function () {
            $("#gov_page").hide().show("slow");
            this.addCreds();
            if(typeof this.rootView !== 'undefined' && typeof this.rootView.treePolicy !== 'undefined'){
                this.policy = this.rootView.treePolicy;
                this.model = this.rootView.policies.get(this.policy);
                this.addEnabledClouds();
                this.populateForm(this.model);
                this.disableTextboxInputs(this);
                //this.renderButtons();
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

            new Spinner(spinnerOptions).spin($("#images_table_aws").get(0));
        },

        treeSelect: function() {
            this.clearSelection();
            this.render();
            this.unselectCloudButtons();
        },

        // renderButtons: function(){
        //     if(this.model.attributes.org_governance["saved_os_cloud"] === true){
        //         this.buttonBehavior("os",false);
        //     }
        //     else{
        //         $("#os_button").removeClass("active");
        //         $("#content_os").hide("fast");
        //         $("#os_tab_item").hide("fast");
        //     }
        //     if(this.model.attributes.org_governance["saved_aws_cloud"] === true ){
        //         this.buttonBehavior("aws",false);
        //     }
        //     else{
        //         $("#aws_button").removeClass("active");
        //         $("#content").hide("fast");
        //         $("#aws_tab_item").hide("fast");
        //     }
        // },

        unselectCloudButtons: function(){
            $("#os_button").removeClass("active");
            $("#content_os").hide("fast");
            $("#os_tab_item").hide("fast");
            $("#aws_button").removeClass("active");
            $("#aws_button").removeClass("active");
            $("#content_aws").hide("fast");
            $("#aws_tab_item").hide("fast");
            $("#defaults").hide("fast");
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
            //enable cloud
            this.cloudEnable();
            //check admin
            this.adminCheck();

        },

        disableTextboxInputs: function(nav){
            var textbox = "";
            $('.input-append input[type=text]').each(function(i, obj){
                textbox = $("#"+obj.id);
                if (textbox.val() === ""){
                    nav.disableInput(textbox,true);
                }
            });
            if( $("#project_name_toggle_aws").is(':checked') ){
                nav.disableInput($("#project_name_aws"),false);
            }
            if( $("#project_name_toggle_os").is(':checked')){
                nav.disableInput($("#project_name_os"),false);
            }
        },
        clickCloudEnable: function(event){
            if($(event.target).attr('checked') === "checked"){
                if($(event.target).attr('id') === "enabled_cloud_aws"){
                    $(".AWS").show("slow");
                    $("#default_cloud").append("<option value=AWS>Amazon Cloud</option>");

                }
                if($(event.target).attr('id') === "enabled_cloud_os"){
                    $(".OS").show("slow");
                    $("#default_cloud").append("<option value=OpenStack>OpenStack Cloud</option>");
                }
            }else{
                if($(event.target).attr('id') === "enabled_cloud_aws"){
                    $(".AWS").hide("slow");
                    $("#default_cloud option[value='AWS']").remove();
                }
                if($(event.target).attr('id') === "enabled_cloud_os"){
                    $(".OS").hide("slow");
                    $("#default_cloud option[value='OpenStack']").remove();
                }
            }
            if($("#default_cloud option").length < 1){
                $("#default_cloud").empty();
                $("#default_cloud").append("<option value=None>No Cloud Enabled</option>");
            }else{
                $("#default_cloud option[value='None']").remove();
            }
        },

        cloudEnable: function(){
            if($("#enabled_cloud_aws").attr('checked') === "checked"){
                $(".AWS").show("slow");
            }
            else{
                $(".AWS").hide("slow");
            }
            if($("#enabled_cloud_os").attr('checked') === "checked"){
                $(".OS").show("slow");
            }
            else{
                $(".OS").hide("slow");
            }
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

            var o = this.populateSavedHash("#content_aws form");
            var oS = this.populateSavedHash("#content_os form");
            var pW = this.populateSavedHash("#content_org form");
            newPolicy.save($("#policy_name").val(),o,oS,pW,this.policy,sessionStorage.org_id);

            if(this.onCreated) {
                this.onCreated();
            }
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

            if(form_name === "#content_aws form")
            {
                o["default_alarms"] = this.alarms;
                o["default_images"] = this.default_images;
            }
            if(form_name === "#content_os form")
            {
                o["default_alarms"] = this.alarms;
                o["default_images"] = this.default_images_os;
            }
            if(form_name === "#content_org form")
            {
                if( $(".os.cloud-button").hasClass("active")){
                    o["saved_os_cloud"] = true;
                }
                if( $(".aws.cloud-button").hasClass("active")){
                    o["saved_aws_cloud"] = true;
                }
                o["default_cloud"] = $("#default_cloud").val();
            }else{
                if(o["enabled_cloud"] === undefined){
                    o["enabled_cloud"] = "";
                }
            }
            return o;
        },
        
        populateFormHelper: function(indicator,p,form){
            var governance = indicator + "_governance";
            for (var key in p) {
              if (p.hasOwnProperty(key)) {
                var typ = $( form + " input[name='"+key+"']" ).prop("type");
                if(typ === "checkbox"){
                    if(typeof p[key] === 'string'){
                        $( form + " input[name='"+key+"'][value='"+p[key]+"']" ).attr('checked','checked');
                    }else{
                        for (var i in p[key]) {
                          $( form + " input[name='"+key+"'][value='"+p[key][i]+"']" ).attr('checked','checked');
                        }
                    }
                }else if(typ === "radio"){
                    $( form + " input[name='"+key+"'][value='"+p[key]+"']" ).attr('checked','checked');
                }else{
                    $("#"+key+"_"+ indicator).val(p[key]);
                }
              }
            }
            if(indicator !== "org"){
                if(p.default_alarms){
                    this.alarms = p.default_alarms;
                }
                for (var j in this.alarms){
                    $("#alarm_table_"+ indicator).append("<tr><td>"+this.alarms[j].namespace+"</td><td>"+this.alarms[j].metric_name+"</td><td>"+this.alarms[j].threshold+"</td><td>"+this.alarms[j].period+"</td><td><a class='btn btn-mini btn-danger remove_alarm'><i class='fa fa-minus-circle icon-white'></i></a></td></tr>");
                }
                
                if(this.model.attributes[governance].default_images)
                {
                    var k;
                    $("#default_images_table_" + indicator).dataTable().fnClearTable();
                    if(indicator === "aws"){
                        this.default_images = this.model.attributes[governance].default_images;
                        for( k in this.default_images){
                            $('input[name=use_approved_images_'+indicator+']').attr('checked', true);
                            $("#default_images_table_" + indicator).dataTable().fnAddData([this.default_images[k]["name"],this.default_images[k]["id"],"<a class='btn btn-mini btn-danger remove_image'><i class='fa fa-minus-circle icon-white'></i></a>"]);
                        }
                    }
                    if(indicator === "os"){
                        this.default_images_os = this.model.attributes[governance].default_images;
                        for( k in this.default_images_os){
                            $('input[name=use_approved_images_'+indicator+']').attr('checked', true);
                            $("#default_images_table_" + indicator).dataTable().fnAddData([this.default_images_os[k]["name"],this.default_images_os[k]["id"],"<a class='btn btn-mini btn-danger remove_image'><i class='fa fa-minus-circle icon-white'></i></a>"]);
                        }
                    }
                }
            }else{
                $("#default_cloud").val(this.model.attributes[governance].default_cloud);
            }
        },
        populateForm: function(model){
            $('input:checkbox').removeAttr('checked');
            $("#policy_name").val(model.attributes.name);
            var p = model.attributes;
            this.populateFormHelper("aws",p["aws_governance"],"#content_aws form");
            this.populateFormHelper("os",p["os_governance"], "#content_os form");
            this.populateFormHelper("org",p["org_governance"], "#content_org form");
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
            if($("#default_informational_aws").val() !== "None"){topicsList.push($("#default_informational_aws").val());}
            if($("#default_warning_aws").val() !== "None"){topicsList.push($("#default_warning_aws").val());}
            if($("#default_error_aws").val() !== "None"){topicsList.push($("#default_error_aws").val());}

            var newAlarmDialog = new CreateAlarmView({cred_id: $("#default_credentials_aws").val(), region: $("#default_region_aws").val(), policy_view: pView,tList: topicsList});
            newAlarmDialog.render();
        },

        addEnabledClouds: function(){
            var clouds;
            if(this.model !== undefined){
                clouds = this.model.attributes;
                $("#default_cloud").empty();
                if(clouds.aws_governance.enabled_cloud === "AWS"){
                    $("#default_cloud").append("<option value=AWS>Amazon Cloud</option>");
                }
                if(clouds.os_governance.enabled_cloud === "OpenStack"){
                    $("#default_cloud").append("<option value=OpenStack>OpenStack Cloud</option>");
                }
                if(clouds.os_governance.enabled_cloud === "" && clouds.aws_governance.enabled_cloud === ""){
                    $("#default_cloud").append("<option value=None>No Cloud Enabled</option>");
                }
            }else{
                $("#default_cloud").append("<option value=AWS>Amazon Cloud</option>");
                $("#default_cloud").append("<option value=OpenStack>OpenStack Cloud</option>");
            }
        },
        addCreds: function(){
            var creds = JSON.parse(sessionStorage.cloud_credentials);
            $("#default_credentials_aws").empty();
            $("#default_credentials_os").empty();

            for (var i in creds) {
                if(creds[i].cloud_credential.cloud_provider === "AWS"){
                    $("#default_credentials_aws").append("<option value='"+creds[i].cloud_credential.id+"'>"+creds[i].cloud_credential.name+"</option>");
                }
                else if(creds[i].cloud_credential.cloud_provider === "OpenStack"){
                    $("#default_credentials_os").append("<option value='"+creds[i].cloud_credential.id+"'>"+creds[i].cloud_credential.name+"</option>");
                }

            }

            if(typeof this.rootView !== 'undefined' && typeof this.rootView.treePolicy !== 'undefined'){
                var tp = this.rootView.policies.get(this.rootView.treePolicy);
                $("#default_credentials_aws").val(tp.attributes.aws_governance.default_credentials);
                $("#default_credentials_os").val(tp.attributes.os_governance.default_credentials);
            }
            if($("#default_credentials_aws").length > 0){
                $("#whole_form_aws").show("slow");
                $("#cred_message_aws").hide("slow");
                this.topics.fetch({ data: $.param({ cred_id: $("#default_credentials_aws").val(), region: $("#default_region_aws").val()}), reset: true });
                this.images.fetch({ data: $.param({ cred_id: $("#default_credentials_aws").val(), region: $("#default_region_aws").val(), platform: $("#filter_platform_aws").val()}), reset: true });
                this.vpcs.fetch({ data: $.param({ cred_id: $("#default_credentials_aws").val(), region: $("#default_region_aws").val()}), reset: true });
                this.subnets.fetch({ data: $.param({ cred_id: $("#default_credentials_aws").val(), region: $("#default_region_aws").val()}), reset: true });
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
            this.topics.fetch({ data: $.param({ cred_id: $("#default_credentials_aws").val(), region: $("#default_region_aws").val()}), reset: true });
            this.images.fetch({ data: $.param({ cred_id: $("#default_credentials_aws").val(), region: $("#default_region_aws").val(), platform: $("#filter_platform_aws").val()}), reset: true });
            this.images_os.fetch({ data: $.param({ cred_id: $("#default_credentials_os").val(), region: $("#default_region_os").val()}), reset: true });
            this.vpcs.fetch({ data: $.param({ cred_id: $("#default_credentials_aws").val(), region: $("#default_region_aws").val()}), reset: true });
            this.subnets.fetch({ data: $.param({ cred_id: $("#default_credentials_aws").val(), region: $("#default_region_aws").val()}), reset: true });
        },

        addAlarm: function(options,indicator){
            this.alarms.push(options);
            $("#alarm_table_" + indicator).append("<tr><td>"+options.namespace+"</td><td>"+options.metric_name+"</td><td>"+options.threshold+"</td><td>"+options.period+"</td><td><a class='btn btn-mini btn-danger remove_alarm'><i class='fa fa-minus-circle icon-white'></i></a></td></tr>");
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
            if($(event.target).parents('table').attr('id') === "default_images_table_aws"){
                defaults = this.default_images;
            }
            if($(event.target).parents('table').attr('id') === "default_images_table_os"){
                defaults = this.default_images_os;
            }
            defaults.splice(trIndex,1);
            return false;
        },

        addAllTopics: function(collection){
            $("#default_informational_aws").empty();
            $("#default_warning_aws").empty();
            $("#default_error_aws").empty();
            collection.each(function(model){
                $("#default_informational_aws").append("<option>"+model.attributes.id+"</option>");
                $("#default_warning_aws").append("<option>"+model.attributes.id+"</option>");
                $("#default_error_aws").append("<option>"+model.attributes.id+"</option>");
            });

            $("#default_informational_aws").append("<option>None</option>");
            $("#default_warning_aws").append("<option>None</option>");
            $("#default_error_aws").append("<option>None</option>");

            if(typeof this.rootView !== 'undefined' && typeof this.rootView.treePolicy !== 'undefined'){
                var p = this.model.attributes.aws_governance;
                $("#default_informational_aws").val(p.default_informational);
                $("#default_warning_aws").val(p.default_warning);
                $("#default_error_aws").val(p.default_error);
            }
        },

        addAllImages: function(collection){
            $(".spinner").remove();
            $("#images_table_aws").dataTable().fnClearTable();
            collection.each(function(model) {
                var rowData = [model.attributes.imageId,model.attributes.imageLocation,model.attributes.architecture];
                $("#images_table_aws").dataTable().fnAddData(rowData);
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
            $("#default_vpc_aws").empty();
            collection.each(function(model) {
                $("#default_vpc_aws").append("<option>"+model.attributes.id+"</option>");
            });
            if(typeof this.rootView !== 'undefined' && typeof this.rootView.treePolicy !== 'undefined'){
                var p = this.model.attributes.aws_governance;
                $("#default_vpc_aws").val(p.default_vpc);
            }
        },

        addAllSubnets: function(collection){
            $("#default_subnet_aws").empty();
            collection.each(function(model) {
                $("#default_subnet_aws").append("<option>"+model.attributes.subnet_id+"</option>");
            });
            if(typeof this.rootView !== 'undefined' && typeof this.rootView.treePolicy !== 'undefined'){
                var p = this.model.attributes.aws_governance;
                $("#default_subnet_aws").val(p.default_subnet);
            }
        },

        clickImage: function(event){
            if($(event.target).parents('table').attr('id') === "images_table_aws"){
                this.selectImage("aws",event.currentTarget);
            }
            if($(event.target).parents('table').attr('id') === "images_table_os"){
                this.selectImage("os",event.currentTarget);
            }
        },

        selectImage: function(provider,target){
            $(".row_selected").removeClass('row_selected');
            $(target).addClass('row_selected');

            var rowData = $("#images_table_"+provider).dataTable().fnGetData(target);

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

            new Spinner(spinnerOptions).spin($("#images_table_aws").get(0));

            this.images.fetch({ data: $.param({ cred_id: $("#default_credentials_aws").val(), region: $("#default_region_aws").val(), platform: $("#filter_platform_aws").val()}), reset: true });
        },

        topicCreate: function(event){
            var createTopicsDialog = new CreateTopicsView({cred_id: $("#default_credentials_aws").val(), region: $("#default_region_aws").val()});
            createTopicsDialog.render();
        },

        vpcCreate: function(event){
            var createVPCsDialog = new CreateVpcsView({cred_id: $("#default_credentials_aws").val(), region: $("#default_region_aws").val()});
            createVPCsDialog.render();
        },

        subnetCreate: function(event){
            var createSubnetDialog = new CreateSubnetView({cred_id: $("#default_credentials_aws").val(), region: $("#default_region_aws").val()});
            createSubnetDialog.render();
        },

        addImage: function(provider,image,image_id){
            var defaults = [];
            if(provider === "aws"){
                defaults = this.default_images;
            }
            else if (provider === "os"){
                defaults = this.default_images_os;
            }
            defaults.push({"name": image ,"id": image_id});
            $("#default_images_table_"+provider).dataTable().fnAddData([image,image_id,"<a class='btn btn-mini btn-danger remove_image'><i class='fa fa-minus-circle icon-white'></i></a>"]);
            $('input[name=use_approved_images_'+provider+']').attr('checked', true);
        },

        // saveImages: function(){
        //     var cells = [];
        //     var rows = $("#default_images_table").dataTable().fnGetNodes();
        //     for(var i=0;i<rows.length;i++)
        //     {
        //         var row = {"name" : $(rows[i]).find("td:eq(0)").html(), "id" : $(rows[i]).find("td:eq(1)").html()};
        //         // Get HTML of 3rd column (for example)
        //         cells.push(row);
        //     }
        //     return cells;
        // },

        /**
        *   Determines the behavior of the textbox next to a checkbox in the form. It disables the
        *   text box if the checkbox is checked.
        */
        checkboxChanged: function(lambda){
            switch(lambda.target.id)
            {
            case "check_rds_aws":
                this.disableInput($("#max_rds_aws"),$("#"+lambda.target.id).is(':checked'));
                break;
            case "check_max_on_demand_aws":
                this.disableInput($("#max_on_demand_aws"),$("#"+lambda.target.id).is(':checked'));
                break;
            case "check_max_reserved_aws":
                this.disableInput($("#max_reserved_aws"),$("#"+lambda.target.id).is(':checked'));
                break;
            case "check_max_dedicated_aws":
                this.disableInput($("#max_dedicated_aws"),$("#"+lambda.target.id).is(':checked'));
                break;
            case "check_max_spot_aws":
                this.disableInput($("#max_spot_aws"),$("#"+lambda.target.id).is(':checked'));
                break;
            case "check_max_in_autoscale_aws":
                this.disableInput($("#max_in_autoscale_aws"),$("#"+lambda.target.id).is(':checked'));
                break;
            case "project_name_toggle_aws":
                this.disableInput($("#project_name_aws"),!$("#"+lambda.target.id).is(':checked'));
                break;
            case "project_name_toggle_os":
                this.disableInput($("#project_name_os"),!$("#"+lambda.target.id).is(':checked'));
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
            case "check_max_volumes_size_os":
                this.disableInput($("#max_volumes_size_os"),$("#"+lambda.target.id).is(':checked'));
                break;
            case "check_max_load_balancers_os":
                this.disableInput($("#max_load_balancers_os"),$("#"+lambda.target.id).is(':checked'));
                break;
            case "check_max_security_groups_os":
                this.disableInput($("#max_security_groups_os"),$("#"+lambda.target.id).is(':checked'));
                break;
            case "check_max_security_group_rules_os":
                this.disableInput($("#max_security_group_rules_os"),$("#"+lambda.target.id).is(':checked'));
                break;
            case "check_max_ips_os":
                this.disableInput($("#max_ips_os"),$("#"+lambda.target.id).is(':checked'));
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

        pnFocus: function(event){
            if(event.target.id === "project_name"){
                $("#project_name_toggle_aws").prop("checked", false);//.prop('checked', true);
            }
        },

        clickCloudTab: function(event){
            $(".tab-selector.active").removeClass("active");
            if(event.target.id === "tab_os"){
                $("#content_aws").hide("slow");
                $("#content_os").show("slow");
                $("#os_tab_item").addClass("active");

            }
            if(event.target.id === "tab_aws"){
                $("#content_aws").show("slow");
                $("#content_os").hide("slow");
                $("#aws_tab_item").addClass("active");
            }

        },
        buttonBehavior: function(nav,user_select)
        {
                var button = $("."+nav+".cloud-button");
                var tab = $("."+nav+".tab-selector");
                var content = $("."+nav+".cont");
                if(user_select){
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
                        $("#defaults").show("slow");
                        $("#clouds_select_msg").hide();
                    }
                    else{
                        $("#defaults").hide("slow");
                        $("#clouds_select_msg").show();
                        $(".content").hide("slow");
                    }
                }else if(!user_select){
                    button.addClass("active");
                    $(".tab-selector").removeClass("active");
                    tab.show("fast");
                    tab.addClass("active");
                    content.show("fast");
                }
        },

        clickCloudButton: function(event){
            if(event.target.id === "os_button" || event.target.id === "os_img"){
                this.buttonBehavior("os",true);
            }
            if(event.target.id === "aws_button" || event.target.id === "aws_img"){
                this.buttonBehavior("aws",true);
            }
        },

        prePopForm: function(){
            this.addEnabledClouds();
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
