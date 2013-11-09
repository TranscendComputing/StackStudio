/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
define([
        'jquery',
        'underscore',
        'backbone',
        'views/dialogView',
        'text!templates/aws/cloud_formation/awsStackCreateTemplate.html',
        '/js/aws/models/cloud_formation/awsStack.js',
        '/js/aws/collections/notification/awsTopics.js',
        '/js/aws/models/notification/awsTopic.js',
        '/js/aws/models/notification/awsSubscription.js',
        'collections/cloudCredentials',
        'common',
        'spinner',
        'messenger',
        'jquery.form'
        
], function( $, _, Backbone, DialogView, StackCreateTemplate, 
    Stack, Topics, Topic, Subscription, CloudCredentials, Common, Spinner, Messenger ) {
    
    var CloudFormationStackCreateView = DialogView.extend({

        template: _.template(StackCreateTemplate),

        stackContent: undefined,

        credentialId: undefined,

        region: undefined,
        stack : undefined,
        mode : "create", // create or run; from cloud management or from stacks page
        currentViewIndex: 0,
        // Delegated events for creating new instances, etc.
        events: {
            "dialogclose": "close",
            "change input[name=templateOption]": "templateOptionChange",
            "click #add_tag": "addTagHandler",
            "click .remove_tag": "removeTagHandler",
            "change #options_checkbox":"showAdvancedOptions",
            "change #notifications_select":"notificationsMenuHandler",
            "change #cloud_credential":"changeCloudCreds",
            "change #cf_create_stack_name":"changeName"
        },

        addTagHandler: function(e){
            e.preventDefault();
            this.tagsTable.fnAddData({});
            var length = this.tagsTable.fnGetNodes().length;
            if(length === 10){
                $("#add_tag_span").hide();
            }
            return false;
        },
        removeTagHandler: function(e){
            e.preventDefault();
            var rowIndex = this.tagsTable.fnGetPosition($(e.currentTarget.parentElement).closest("tr")[0]);
            this.tagsTable.fnDeleteRow(rowIndex);
            $("#add_tag_span").show();

            return false;
        },
        initialize: function(options) {
            this.credentialId = options.cred_id;
            this.region = options.region;
            this.stack = new Stack();
            this.topics = new Topics();
            if (this.region && this.credentialId) {
                this.fetchTopics();
            }
            if (options.mode) {
                this.mode = options.mode;
            }
            if (options.stack) {
                this.stack.set("name", options.stack.get("name"));
            }
            this.stackContent = options.content;
            Common.vent.on("reloadTopics", this.fetchTopics);
        },
        render: function() {
            var createView = this;
            this.$el.html(this.template);

            this.$el.dialog({
                autoOpen: true,
                title: this.mode === "create"? "Create Stack" : "Run Stack",
                width:575,
                minHeight: 500,
                resizable: false,
                modal: true,
                buttons: {
                    Previous: {
                        text: "Previous",
                        id: "previous_button",
                        click: function() {
                            createView.previous();
                        }
                    },
                    Next: {
                        text: "Next",
                        id: "next_button",
                        click: function() {
                            createView.next();
                        }
                    }
                }
            });
            if (this.mode === "run") {
                var name = this.stack.attributes.name;
                $("#cf_create_stack_name").val(name);
                $(".cloud_creds").show();
                $(".template_source").hide();
            } else {
                $(".cloud_creds").hide();
            }
            this.tagsTable = $("#view2 table").dataTable({
                "bJQueryUI": true,
                "bPaginate": false,
                "bSort": false,
                "sDom": 't',
                "aoColumns": [{"sTitle": "Key",mData: function(){
                        return "<input type='text'/>";
                    }},
                    {"sTitle": "Value", mData: function(){
                        return "<input type='text'/>";
                    }},
                    {"sTitle": "Remove",  mData: function(){
                        return "<span><a href='#' class='remove_tag'>X</span>";
                    }}
                ],
                "oLanguage": {
                    "sEmptyTable": "",
                    "sZeroRecords": ""
                }
            });
            // From CloudManagement, credentials are chosen; if not, enable in view.
            if (!this.region || !this.credentialId) {
                this.cloudCredentials = new CloudCredentials();
                this.cloudCredentials.on('reset', this.populateCredentials, this);
                this.cloudCredentials.fetch();
            }
            this.tagsTable.fnAddData({});
            this.refreshView(0);
            $(".template_input").hide();
        },

        fetchTopics: function(){
            var $this = this;
            this.topics.fetch(
                {
                    data: $.param({ cred_id: this.credentialId, region: this.region }),
                    success: _.bind(function(collection){
                        var menu = $("#notifications_select");
                        menu.html("");
                        menu.append("<option value=''>(no notification)</option>");
                        menu.append("<option value='#create_topic'>Create a new SNS topic</option>");
                        collection.each(_.bind(function(model){
                            var option = $("<option></option>")
                            .attr("value", model.id)
                            .html(model.get("Name"));
                            if(this.selectedTopic === model.id){
                                option.attr("selected", "selected");
                            }
                            menu.append("<option value='"+model.id +"'>"+ model.get("Name")+"</option>");
                        }, this));
                    }, this),
                    error:function(xhr){
                        Common.errorDialog("Topic Retrieval Failure", "Could not retrieve SNS topics");
                    }
                });
        },
        changeName: function(evt) {
            var name = $("#cf_create_stack_name").val();
            name = this.slugify(name);
            this.stack.set("name", name);
            $("#cf_create_stack_name").val(name);
        },
        populateCredentials: function() {
            var list = this.cloudCredentials;
            var select = $("#cf_cloud_creds")
                .empty()
                .on("change", $.proxy(this.credentialChangeHandler, this));
            list.forEach(function(element, index, list) {
                // For now, only AWS supports stacks.
                if (element.get("cloud_name") === "Amazon Web Services") {
                    $('<option>')
                        .text(element.get("cloud_name") + ":" + element.get("name"))
                        .data("cloudCredentials", element)
                        .appendTo(select);
                }
            });
            select.change();
        },
        credentialChangeHandler: function(evt) {
            var optionSelected = $("option:selected", evt.target);
            var credential = optionSelected.data("cloudCredentials");
            if (!credential) {
                return;
            }
            this.credentialId = credential.id;
            this.cloudProvider = credential.get("cloud_provider").toLowerCase();
            this.populateRegions();
            if (this.region && this.credentialId) {
                this.fetchTopics();
            }
        },
        populateRegions: function() {
            var response = $.ajax({
                url: "samples/cloudDefinitions.json",
                async: false
            }).responseText;
            var select = $("#cf_cloud_region")
                .empty()
                .on("change", $.proxy(this.regionChangeHandler, this));
            this.cloudDefinitions = $.parseJSON(response);
            if(this.cloudDefinitions[this.cloudProvider].regions.length) {
                $.each(this.cloudDefinitions[this.cloudProvider].regions, function(index, region) {
                    //regions check
                    var addRegion = false;
                    if(JSON.parse(sessionStorage.group_policies)[0] == null){
                        addRegion = true;
                    }else{
                        $.each(JSON.parse(sessionStorage.group_policies), function(index,value){
                            if(value != null){
                                var usable_regions = value.group_policy.aws_governance.usable_regions;
                                if($.inArray(region.name, usable_regions) !== -1){
                                    addRegion = true;
                                }
                            }
                        });
                    }
                    if (addRegion) {
                        $('#cf_cloud_region').append($("<option value='" + region.zone + "'></option>").text(region.name));
                    }
                });
            }
            select.change();
        },
        regionChangeHandler: function(evt) {
            var optionSelected = $("option:selected", evt.target);
            this.region = optionSelected.val();
            if (this.region && this.credentialId) {
                this.fetchTopics();
            }
        },        
        templateOptionChange: function(e){
            var templateInput = $(e.currentTarget.parentElement).find("input[name=template]");
            $(".template_input").hide();
            templateInput.show();
        },

        next: function() {
            if(this.currentViewIndex === 3) {
                this.create();
            }else if(this.currentViewIndex ===2){
                this.renderReviewScreen();
                this.currentViewIndex++;
                this.refreshView(this.currentViewIndex);
            }
            else {
                var validated = this.validateInputFields(this.currentViewIndex);
                if(validated){
                    if(this.currentViewIndex === 0){
                        Common.vent.once("templateValidated", _.bind(function(result){
                            Common.vent.off("templateValidationFailed");
                            this.topicHandler(result);
                        }, this));
                        Common.vent.once("templateValidationFailed", function(xhr){
                            Common.vent.off("templateValidated");
                            Common.errorDialog("Template Validation Failed", JSON.parse(xhr.responseText).message);
                        });
                    }else{
                        this.currentViewIndex++;
                        this.refreshView(this.currentViewIndex);
                    }
                }
            }

        },
        create: function(){
            var creationParams = this.generateCreationParams();
            var spinnerOptions = {
                length: 50, // The length of each line
                width: 12, // The line thickness
                radius: 25, // The radius of the inner circle
                corners: 1, // Corner roundness (0..1)
                rotate: 0, // The rotation offset
                color: '#000', // #rgb or #rrggbb
                speed: 1, // Rounds per second
                trail: 60, // Afterglow percentage
                shadow: false, // Whether to render a shadow
                hwaccel: false, // Whether to use hardware acceleration
                className: 'spinner', // The CSS class to assign to the spinner
                zIndex: 2e9 // The z-index (defaults to 2000000000)
            };
            new Spinner(spinnerOptions).spin($("#cf_stack_create").get(0));

            this.stack.create(creationParams, this.credentialId, this.region).
                always(function(xhr) {
                    $(".spinner").remove();
                });
            Common.vent.once("cloudFormationStackCreated", _.bind(function(){
                var messengerString = "Stack " + (this.mode === "create"? "creation":"run") +
                    " in progress.";
                new Messenger().post({type:"success", message:messengerString});
                this.$el.dialog('close');
            }, this));
        },
        topicHandler: function(validateTemplateResult){
            var nextPage = _.bind(function(){
                this.currentViewIndex++;
                this.refreshView(this.currentViewIndex);
                this.populateParameters(validateTemplateResult.Parameters);
            }, this);

            if($("#notifications_select").val() !=="#create_topic"){
                nextPage();
            }else{
                var newTopic = new Topic();
                var newSubscription = new Subscription();

                var snsName = $("#new_sns_name").val();
                var snsEmail = $("#new_sns_email").val();

                var options = {"name": $("#new_sns_name").val()};
                newTopic.create(options, this.credentialId, this.region, "topicCreated");
                Common.vent.once("topicCreated", _.bind(function(response){
                    var topicId = response.data.body.TopicArn;
                    var topicName = topicId.split(":").pop();
                    $("#notifications_select").append("<option value='"+ topicId +"'>"+ topicName+"</option>");
                    $("#notifications_select").val(topicId);

                    $("#new_topic_form").find(":input").val("");
                    $("#new_topic_form").hide();

                    options = {"endpoint": snsEmail, "protocol":"email"};
                    newSubscription.create(response.data.body.TopicArn, options, this.credentialId, this.region, "subscriptionCreated");
                    Common.vent.once("subscriptionCreated",function(){
                        nextPage();
                    });
                }, this));
            }
        },
        previous: function() {
            this.currentViewIndex--;
            this.refreshView(this.currentViewIndex);
        },
        renderReviewScreen: function(){
            var templateField;
            if (this.mode !== "run") {
                templateField = $("#view0").find("input[type=radio]:checked").parent().find("input[name=template]");
            } else {
                templateField = $("#cf_create_stack_name");
            }
            $("#name_review").html($("#cf_create_stack_name").val());
            $("#description_review").html(templateField.data("TemplateInfo").Description);
            $("#template_review").html(templateField.val().split("C:\\fakepath\\").pop());

            var parameters = "";
            var lastNode = $("#parameter_review_title");
            $(".parameter_item").remove();
            $("#parameters_list :input").each(function(index, node){
                var name = node.name.split("Parameter.")[1];
                var value = node.value;
                lastNode = $("<tr></tr>")
                .addClass("parameter_item")
                .append("<td><b>"+name+":</b></td>")
                .append("<td>"+value+"</td>")
                .insertAfter(lastNode);
            });


            var topic = $("#notifications_select :selected").text() === "" ? "none" : $("#notifications_select :selected").text();
            $("#notification_review").html(topic);

            var timeout = $("#creation_timeout_select").val() === 0 ? "none" : $("#creation_timeout_select").val();
            $("#create_timeout_review").html(timeout);

            $("#rollback_review").html($("#view0").find(":input[name=rollback]:checked").val());


        },
        generateCreationParams: function(){
            var templateField;
            templateField = $("#view0").find("input[type=radio]:checked").parent().find("input[name=template]");
            if (this.mode === "run") {
                templateField = $("#cf_create_stack_name");
            }
            var creationParams= {
                "StackName": $("#cf_create_stack_name").val(),
                "Parameters": {},
                "Tags" : {},
                "Capabilities": [],
                "NotificationARNs": []
            };
            if (this.mode !== "run" && templateField && templateField.attr("type") ==="url"){
                creationParams["TemplateURL"] = templateField.val();
            }else{
                creationParams["TemplateBody"] = JSON.stringify(templateField.data("TemplateBody"));
            }

            if($("#notifications_select").val() !== ""){
                creationParams["NotificationARNs"].push($("#notifications_select").val());
            }
            if(parseInt($("#creation_timeout_select").val(), 10) !== 0){
                creationParams["TimeoutInMinutes"] = parseInt($("#creation_timeout_select").val(), 10);
            }

            creationParams["DisableRollback"] = $("#view0").find(":input[name=rollback]:checked").val() === "true" ? true : false;

            $("#parameters_list :input").each(function(index, node){
                var name = node.name.split("Parameter.").pop();
                var value = node.value;
                creationParams["Parameters"][name] = value;
            });

            if($("#iam_acknowledge").is(":checked")){
                creationParams["Capabilities"].push("CAPABILITY_IAM");
            }

            $("#stack_tags_table tbody tr").each(function(index, node){
                var name = $(node).find(":input").first().val();
                var value = $(node).find(":input").last().val();
                if(!(name === "" && value==="")){
                    creationParams["Tags"][name] = value;
                }
            });
            return creationParams;
        },

        refreshView: function (viewIndex) {
            $(".view_stack").hide();
            $("#view"+viewIndex).show();
            this.currentViewIndex = viewIndex;

            if(this.currentViewIndex === 0) {
                $("#previous_button").addClass("ui-state-disabled");
                $("#previous_button").attr("disabled", true);
            }else {
                $("#previous_button").removeClass("ui-state-disabled");
                $("#previous_button").attr("disabled", false);
            }

            if(this.currentViewIndex === 3) {
               // this.renderReviewScreen();
                $("#next_button").text("Create");
            }else {
                $("#next_button").text("Next");
            }
            $("#next_button").button();
        },
        validateInputFields: function(viewIndex) {
            if (viewIndex !== 0) {
                return true;
            }
            var allValid = false;

            var validField = $("#cf_create_stack_name").val().trim() !== "";
            this.displayValid(validField, "#cf_create_stack_name");
            allValid = validField;

            var templateField = $("#view0").find("input[type=radio]:checked").parent().find("input[name=template]");
            if(templateField.length === 0 || !templateField.val() || templateField.val() === ""){
                if (!this.stackContent) { // don't require if content passed in
                    allValid = false;
                    this.displayValid(false, templateField);
                }
            }
            else{
                this.displayValid(true, templateField);
            }
            if (!this.credentialId) {
                this.displayValid(false, "#cf_cloud_creds");
            }
            if (!this.region) {
                this.displayValid(false, "#cf_cloud_region");
            }
            if($("#notifications_select").val() ==="#create_topic"){
                validField = $("#new_sns_name").val().trim() !== "";
                allValid = allValid && validField;
                this.displayValid(validField, "#new_sns_name");


                validField = $("#new_sns_email").val().trim() !== "";
                allValid = allValid && validField;
                this.displayValid(validField, "#new_sns_email");
            }
            if(allValid){
                this.validateTemplate();
            }
            return allValid;
        },

        validateTemplate: function(){
            var templateField, sendForm, templateValue;

            if (this.stackContent === undefined) {
                templateField = $("#view0").find("input[type=radio]:checked").parent().find("input[name=template]");
                templateValue = templateField.val();
            } else {
                templateValue = this.stackContent;
            }
            if(templateValue && templateValue !==""){
                var ajaxer;
                var type = templateField? templateField[0].type : "body";
                var apiUrl = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/cloud_formation/template/validate?cred_id=" + this.credentialId + "&type="+ type;
                var spinnerOptions = {
                    length: 50, // The length of each line
                    width: 12, // The line thickness
                    radius: 25, // The radius of the inner circle
                    corners: 1, // Corner roundness (0..1)
                    rotate: 0, // The rotation offset
                    color: '#000', // #rgb or #rrggbb
                    speed: 1, // Rounds per second
                    trail: 60, // Afterglow percentage
                    shadow: false, // Whether to render a shadow
                    hwaccel: false, // Whether to use hardware acceleration
                    className: 'spinner', // The CSS class to assign to the spinner
                    zIndex: 2e9 // The z-index (defaults to 2000000000)
                };
                new Spinner(spinnerOptions).spin($("#cf_stack_create").get(0));
                if(type==="file"){
                    //$("#template_upload").attr("action", apiUrl);
                    
                    sendForm = $('<form></form>')
                    .attr("action", apiUrl)
                    .attr("enctype", "multipart/form-data")
                    .attr("method", "POST")
                    .html(templateField)
                    .ajaxForm({
                        dataType: 'json',
                        success: function(response){
                            $(".spinner").remove();
                            templateField.data("TemplateBody", response.TemplateBody);
                            templateField.data("TemplateInfo", response.ValidationResult);
                            Common.vent.trigger("templateValidated", response.ValidationResult);
                        },
                        error: function(xhr){
                            $(".spinner").remove();
                            Common.vent.trigger("templateValidationFailed", xhr);
                            //Common.errorDialog(xhr.statusText, JSON.parse(xhr.responseText).message);
                        }
                    });
                    ajaxer = sendForm.submit();
                    $("#template_file_span").html(templateField);
                    // $("#template_upload").submit();
                }
                else if(type==="url"){
                    ajaxer = $.ajax({
                        success:function(response){
                            templateField.data("TemplateInfo", response.ValidationResult);
                        },
                        type: "POST",
                        url: apiUrl,
                        data: JSON.stringify({"TemplateURL": templateField.val()})
                    });
                }
                else if(type==="body"){                   
                    ajaxer = $.ajax({
                        url: apiUrl,
                        type: "POST",
                        data: this.stackContent,
                        processData: false,
                        dataType: 'json',
                        success: function(response){
                            // Content passed in; don't have a control to set, use template name.
                            templateField = $("#cf_create_stack_name");
                            templateField.data("TemplateBody", response.TemplateBody);
                            templateField.data("TemplateInfo", response.ValidationResult);
                        }
                    });
                }
                if (ajaxer && ajaxer.always) {
                    ajaxer.done(function(response, textStatus, xhr) {
                        Common.vent.trigger("templateValidated", response.ValidationResult);
                    });
                    ajaxer.fail(function(xhr, textStatus, errorThrown) {
                        Common.vent.trigger("templateValidationFailed", xhr);
                    });
                    ajaxer.always(function(data) {
                        $(".spinner").remove();
                    });
                }
            }
            return;
        },
        populateParameters: function(parameters){
            $("#parameters_list").html("");
            for(var i =0; i < parameters.length; i++){
                var key = parameters[i].ParameterKey;
                var defaultValue = parameters[i].DefaultValue ? parameters[i].DefaultValue : "";
                var inputType = parameters[i].NoEcho ? "password" : "text";
                $("#parameters_list").append("<label for='Parameter."+key+"'>"+key+"</label><input type='"+inputType+"' name='Parameter."+key+"' id='Parameter."+key+"' value='"+defaultValue+"'/>");


            }
        },
        displayValid: function(valid, node) {
            var target = "border-color";
            var selector = node;
            if(node[0] && node[0].type === "file"){
                selector = node[0];
                target = "color";
            }
            if(valid) {
                $(selector).css(target, "");
            }else{
                $(selector).css(target, "red");
            }
        },
        showAdvancedOptions: function(e){
            if($(e.currentTarget).is(":checked")){
                $("#advanced_options").show();
            }else{
                $("#advanced_options").hide();
            }
        },
        notificationsMenuHandler: function(e){
            if($(e.currentTarget).val() === "#create_topic"){
                $("#new_topic_form").show();
            }else{
                $("#new_topic_form").hide();
            }
        },
        changeCloudCreds: function(evt){
            if($(evt.currentTarget).is(":checked")){
                $("#advanced_options").show();
            }else{
                $("#advanced_options").hide();
            }
        },
        slugify: function(str) {
            str = str.replace(/^\s+|\s+$/g, ''); // trim

            // remove accents, swap ñ for n, etc
            var from = "ãàáäâẽèéëêìíïîõòóöôùúüûñç·/_,:;";
            var to   = "aaaaaeeeeeiiiiooooouuuunc      ";
            for (var i=0, l=from.length ; i<l ; i++) {
                str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
            }

            str = str.replace(/[^A-Za-z0-9]/g, '') // remove invalid chars
                .replace(/\s+/g, ''); // collapse whitespace 
            return str;
        }

        
    });
    
    return CloudFormationStackCreateView;
});
