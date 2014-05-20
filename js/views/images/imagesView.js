/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true requirejs:true require:true alert:true*/
define([
        'jquery',
        'underscore',
        'bootstrap',
        'backbone',
        'common',
        'text!templates/images/imagesTemplate.html',
        'text!templates/images/advancedTemplate.html',
        'models/packedImage',
        'aws/collections/compute/awsImages',
        'collections/packedImages',
        'messenger',
        'jquery-ui',
        'jquery.form'
], function( $, _, bootstrap, Backbone, Common, imagesTemplate, advancedTemplate, PackedImage, Images, PackedImages, Messenger ) {

    var ImagesView = Backbone.View.extend({

        tagName: 'div',

        template: _.template(imagesTemplate),

        currentImageTemplate: undefined,

        images: undefined,

        packed_images: undefined,

        events: {
            "click #new_image_template_button": "newImageTemplate",
            "click #close_image_template_button": "closeImageTemplate",
            "change #image_type_select":"builderSelect",
            "change #image_config_management_select":"provisionerSelect",
            "change #dev_ops_select":"devopsSelect",
            "change #post_processor_select":"postProcessorSelect",
            "change #openstack_type_select":"openstackTypeSelect",
            "change select":"selectChange",
            "click #adv_collapse_btn":"advCollapseBtn",
            "click .adv_tab": "advTabSelect",
            "click #save_image_template_button":"saveButton",
            "click #deploy_image_template_button":"deployImage",
            "click .img_item":"loadPackedImage",
            "click .append-btn":"appendButton",
            "focus #os_input": "openImageList",
            "focusout #os_input": "selectImageList",
            "click #delete_image_template_button":"deleteImage",
            //"click input[type='checkbox'][name='clouds_select']":"cloudSelect",
            "keyup":"keyUp",
            "click .cloud-button":"cloudSelect"
        },

        initialize: function() {
            $("#main").html(this.el);
            this.$el.html(this.template);
            // $("#packed_images").accordion({
//                 collapsible: true,
//                 heightStyle: "content"
//             });

            var creds = JSON.parse(sessionStorage.cloud_credentials);
            $("#aws_cred_select").empty();
            for (var i in creds) {
                if(creds[i].cloud_credential.cloud_provider === "AWS"){
                    $("#aws_cred_select").append("<option value='"+creds[i].cloud_credential.id+"' data-ak='"+creds[i].cloud_credential.access_key+"' data-sk='"+creds[i].cloud_credential.secret_key+"'>"+creds[i].cloud_credential.name+"</option>");
                }
            }

            this.packed_images = new PackedImages();
            this.packed_images.on( 'reset', this.addAllPackedImages, this );

            this.images = new Images();
            this.images.on( 'reset', this.addAllImages, this );

            var piView = this;
            Common.vent.on("packedImageAppRefresh", function(data) {
                console.log(data);
                piView.currentImageTemplate = data['Id'];
                piView.uploadAsync();
                piView.packed_images.fetch({reset: true});
            });
            Common.vent.on("packedImageAppDelete", function() {
                piView.currentImageTemplate = 'test';
                window.location.hash = "#images";
            });

            this.fetchDropDowns();
            this.images.fetch({reset: true});
            this.packed_images.fetch({reset: true});

            $('#upForm').ajaxForm({
                success: function(data) {
                    new Messenger().post({type:"success", message:"File Uploaded..."});
                },
                contentType: 'application/x-www-form-urlencoded'
            });
        },

        render: function() {
            //Fetch image templates
            if(this.currentImageTemplate) {
                $("#image_template_not_opened").hide();
                $("#image_template_open").show();
                this.showAvailableClouds();
                if(this.currentImageTemplate === "") {
                    // Set image template fields to defaults
                }else {
                    // Fill in the image template fields to match the selected image template
                    // this.popForm(this.currentImageTemplate);
                }
            }else {
                $("#save_image_template_button").attr("disabled",true);
                $("#image_template_open").hide();
                $("#image_template_not_opened").show();
            }
        },

        showAvailableClouds: function(){
            var policy = JSON.parse(sessionStorage.group_policies);
            var permissions = JSON.parse(sessionStorage.permissions);
            if(policy.length > 0 && permissions.length < 1){
                policy = policy[0].group_policy;
                var count = 0;
                if(policy.aws_governance.enabled_cloud.toLowerCase() === "aws"){
                    count++;
                    $("#save_image_template_button").attr("disabled",false);
                    $("#aws_toggle").show();
                }
                if(policy.os_governance.enabled_cloud.toLowerCase() === "openstack"){
                    count++;
                    $("#save_image_template_button").attr("disabled",false);
                    $("#os_toggle").show();
                }
                if(count === 0){
                    $(".cloud-button").hide();
                    $("#image_settings_accordion").hide();
                    $("#clouds_select_msg").html("No cloud providers available");
                    $("#image_template_open :input").attr("disabled",true);
                    $("#save_image_template_button").attr("disabled",true);
                }
            }else{
                $("#save_image_template_button").attr("disabled",false);
                $(".cloud-button").show();
            }
        },

        newImageTemplate: function() {
            if(this.currentImageTemplate) {
                var confirmation = confirm("Are you sure you want to open a new image template? Any unsaved changes to the current template will be lose.");
                if(confirmation === true) {
                    this.clearForm();
                    this.currentImageTemplate = "test";
                    this.render();
                }
            }else {
                this.clearForm();
                this.currentImageTemplate = "test";
                this.render();
            }
        },

        fetchDropDowns: function(){
            $("#builder_settings").empty();
            $.getJSON( Common.apiUrl + "/stackstudio/v1/packed_images/builders", function( builders ) {
                $("#image_type_select").empty();
                $("#image_type_select").append("<option>None</option>");
                $("#openstack_type_select").empty();
                $("#openstack_type_select").append("<option>None</option>");
                for (var key in builders) {
                    if(key === 'qemu' ){
                        $("#openstack_type_select").append("<option>"+key+"</option>");
                    }else{
                        $("#image_type_select").append("<option>"+key+"</option>");
                    }
                }
                // $.getJSON( Common.apiUrl + "/stackstudio/v1/packed_images/builders/" + $("#image_type_select").val().replace('-',''), function( builder ) {
//                     $("#builder_settings").html(_.template(advancedTemplate)({optional: builder.optional, advanced: builder.advanced, qemu: undefined, required: builder.required, title: "Builder: "+$("#image_type_select").val()}));
//                     $("#builder_settings").tooltip();
//                 });
            });
            $.getJSON( Common.apiUrl + "/stackstudio/v1/packed_images/provisioners", function( provisioners ) {
                $("#image_config_management_select").empty();
                $("#dev_ops_select").empty();
                $("#dev_ops_select").append("<option>None</option>");
                $("#image_config_management_select").append("<option>None</option>");
                for (var key in provisioners) {
                    if(key === 'chef-solo' || key === 'salt-masterless'){
                        $("#dev_ops_select").append("<option>"+key+"</option>");
                    }else{
                        $("#image_config_management_select").append("<option>"+key+"</option>");
                    }
                }
                // $.getJSON( Common.apiUrl + "/stackstudio/v1/packed_images/provisioners/" + $("#image_config_management_select").val(), function( provisioner ) {
//                     if(provisioner.required_xor !== undefined){
//                         provisioner.required = provisioner.required_xor;
//                     }
//                     $("#provisioner_settings").html(_.template(advancedTemplate)({optional: provisioner.optional, advanced: provisioner.advanced, qemu: undefined, required: provisioner.required, title: "Provisioner: "+$("#image_config_management_select").val()}));
//                     $("#provisioner_settings").tooltip();
//                 });
//                 $.getJSON( Common.apiUrl + "/stackstudio/v1/packed_images/provisioners/" + $("#dev_ops_select").val(), function( provisioner ) {
//                     $("#devops_settings").html(_.template(advancedTemplate)({optional: provisioner.optional, advanced: provisioner.advanced, qemu: undefined, required: provisioner.required, title: "DevOps Tool: "+$("#dev_ops_select").val()}));
//                     $("#devops_settings").tooltip();
//                 });
            });
            $.getJSON( Common.apiUrl + "/stackstudio/v1/packed_images/postprocessors", function( postprocessors ) {
                $("#post_processor_select").empty();
                $("#post_processor_select").append("<option>None</option>");
                for (var key in postprocessors) {
                    $("#post_processor_select").append("<option>"+key+"</option>");
                }
                // $.getJSON( Common.apiUrl + "/stackstudio/v1/packed_images/postprocessors/" + $("#post_processor_select").val().replace('-',''), function( postprocessor ) {
//                     var q = postprocessor.optional['qemu'];
//                     delete postprocessor.optional['qemu'];
//                     $("#postprocessor_settings").html(_.template(advancedTemplate)({optional: postprocessor.optional, advanced: postprocessor.advanced, qemu: q, required: postprocessor.required, title: "Post-Processor: "+$("#post_processor_select").val()}));
//                     $("#postprocessor_settings").tooltip();
//                 });
            });
        },

        addAllImages: function() {
            var createView = this;
            $("#os_input").autocomplete({
                source: createView.images.toJSON(),
                minLength: 0
            })
            .data("autocomplete")._renderItem = function (ul, item){
                var imagePath;
                switch(item.logo)
                {
                case "aws":
                    imagePath = "/images/ImageLogos/amazon20.png";
                    break;
                case "redhat":
                    imagePath = "/images/ImageLogos/redhat20.png";
                    break;
                case "suse":
                    imagePath = "/images/ImageLogos/suse20.png";
                    break;
                case "ubuntu":
                    imagePath = "/images/ImageLogos/canonical20.gif";
                    break;
                case "windows":
                    imagePath = "/images/ImageLogos/windows20.png";
                    break;
                case "centos":
                    imagePath = "/images/ImageLogos/centos.gif";
                    break;
                case "fedora":
                    imagePath = "/images/ImageLogos/fedora36.png";
                    break;
                }
                var img = '<td style="width:22px;" rowspan="2"><img height="20" width="20" src="'+imagePath+'"/></td>';
                var name = '<td>'+item.label+'</td>';
                var description = '<td>'+item.description+'</td>';
                var imageItem = '<a><table stlye="min-width:150px;"><tr>'+ img + name + '</tr><tr>' + description + '</tr></table></a>';
                return $("<li>").data("item.autocomplete", item).append(imageItem).appendTo(ul);
            };
        },

        addAllPackedImages: function(collection){
            $("#packed_images_list").empty();
            collection.each(function(model) {
                $("#packed_images_list").append("<li><a href='#images/"+model.attributes.doc_id+"' id='"+model.attributes.doc_id+"' class='img_item'>"+model.attributes.name+"</a></li>");
                this.addListIcons(model.attributes.base_image,$("#"+model.attributes.doc_id));
            },this);
            if(this.currentImageTemplate === 'test'){
                this.clearForm();
            }else if(this.currentImageTemplate){
                this.popForm(this.currentImageTemplate);
            }
        },

        addListIcons: function(base,e){
            //debugger
            var iMap = {
                "aws":"/images/CloudLogos/amazon.png",
                "openstack":"/images/CloudLogos/openstack.png",
                "chef-solo":"/images/CompanyLogos/chef50.png",
                "salt-masterless":"/images/CompanyLogos/salt50.jpg",
                "Amazon":"/images/ImageLogos/amazon20.png",
                "Ubuntu":"/images/ImageLogos/canonical20.gif",
                "Fedora":"/images/ImageLogos/fedora36.png",
                "CentOS":"/images/ImageLogos/centos.gif",
                "Red":"/images/ImageLogos/redhat20.png"
            };
            if(base.devops_tool !== "None"){
                e.after('<img src="'+iMap[base.devops_tool]+'" style="width:16px;"/>');
            }
            if(base.os !== "None"){
                e.after('<img src="'+iMap[base.os.split(" ")[0]]+'" style="width:16px;"/>');
            }
            //base.os !== "None" && e.after(base.os);
            $.each(base.clouds, function( index, value ) {
              e.after('<img src="'+iMap[value]+'" />');
            });
        },

        openImageList: function() {
            if($("ul.ui-autocomplete").is(":hidden")) {
                $("#os_input").autocomplete("search", "");
            }
        },

        selectImageList: function() {
            $("#os_input_msg").empty();
            $("#os_input").css('border-color','grey');
            if($("#clouds_select_openstack").is(':checked')){
                if($("#os_input").val().indexOf("Amazon") !== -1){
                    $("#os_input").css('border-color','red');
                    $("#os_input_msg").html("Amazon Linux not compatible with OpenStack");
                }else if($("#os_input").val().indexOf("Red Hat") !== -1){
                    $("#os_input").css('border-color','red');
                    $("#os_input_msg").html("Red Hat not compatible with OpenStack, try CentOS or Fedora");
                }
            }
        },

        builderSelect: function(){
            var me = this;
            if($("#image_type_select").val() !== "None"){
                $.getJSON( Common.apiUrl + "/stackstudio/v1/packed_images/builders/" + $("#image_type_select").val().replace('-',''), function( builder ) {
                    $("#builder_settings").html(_.template(advancedTemplate)({optional: builder.optional, advanced: builder.advanced, qemu: undefined, required: builder.required, title: "Builder: "+$("#image_type_select").val()})).hide().fadeIn('slow');
                    $("#builder_settings").tooltip();
                    me.mapAdvanced("builders",me.currentImageTemplate);
                });
            }else{
                $("#builder_settings").hide('slow').html('');
            }
        },

        provisionerSelect: function(){
            var me = this;
            if($("#image_config_management_select").val() !== "None"){
                $.getJSON( Common.apiUrl + "/stackstudio/v1/packed_images/provisioners/" + $("#image_config_management_select").val(), function( provisioner ) {
                    if(provisioner.required_xor !== undefined){
                        provisioner.required = provisioner.required_xor;
                    }
                    $("#provisioner_settings").html(_.template(advancedTemplate)({optional: provisioner.optional, advanced: provisioner.advanced, qemu: undefined, required: provisioner.required, title: "Provisioner: "+$("#image_config_management_select").val()})).hide().fadeIn('slow');
                    $("#provisioner_settings").tooltip();
                    me.mapAdvanced("provisioners",me.currentImageTemplate);
                });
            }else{
                $("#provisioner_settings").hide('slow').html('');
            }
        },

        devopsSelect: function(){
            var me = this;
            if($("#dev_ops_select").val() !== "None"){
                $.getJSON( Common.apiUrl + "/stackstudio/v1/packed_images/provisioners/" + $("#dev_ops_select").val(), function( provisioner ) {
                    $("#devops_settings").html(_.template(advancedTemplate)({optional: provisioner.optional, advanced: provisioner.advanced, qemu: undefined, required: provisioner.required, title: "DevOps Tool: "+$("#dev_ops_select").val()})).hide().fadeIn('slow');
                    $("#devops_settings").tooltip();
                    me.mapAdvanced("provisioners",me.currentImageTemplate);
                });
            }else{
                $("#devops_settings").hide('slow').html('');
            }
        },

        postProcessorSelect: function(){
            var me = this;
            if($("#post_processor_select").val() !== "None"){
                $.getJSON( Common.apiUrl + "/stackstudio/v1/packed_images/postprocessors/" + $("#post_processor_select").val(), function( postprocessor ) {
                    var q = postprocessor.optional['qemu'];
                    delete postprocessor.optional['qemu'];
                    $("#postprocessor_settings").html(_.template(advancedTemplate)({optional: postprocessor.optional, advanced: postprocessor.advanced, qemu: q, required: postprocessor.required, title: "Post-Processor: "+$("#post_processor_select").val()})).hide().fadeIn('slow');
                    $("#postprocessor_settings").tooltip();
                    me.mapAdvanced("post-processors",me.currentImageTemplate);
                });
            }else{
                $("#postprocessor_settings").hide('slow').html('');
            }
        },

        openstackTypeSelect: function(){
            var me = this;
            if($("#openstack_type_select").val() !== "None"){
                $.getJSON( Common.apiUrl + "/stackstudio/v1/packed_images/builders/" + $("#openstack_type_select").val().replace('-',''), function( builder ) {
                    $("#openstack_settings").html(_.template(advancedTemplate)({optional: builder.optional, advanced: builder.advanced, qemu: undefined, required: builder.required, title: "Builder: "+$("#openstack_type_select").val()})).hide().fadeIn('slow');
                    $("#openstack_settings").tooltip();
                    me.mapAdvanced("builders",me.currentImageTemplate);
                });
            }else{
                $("#openstack_settings").hide('slow').html('');
            }
        },

        advTabSelect: function(event){
            $("li.active").removeClass('active');
            $("#"+event.target.id).closest('li').addClass('active');
            $(".adv_tab_panel").hide('slow');
            if(event.target.text === "AWS"){
                $("#builder_settings").show('slow');
            }else if(event.target.text === "Openstack"){
                $("#openstack_settings").show('slow');
            }else if(event.target.text === "Provisioner"){
                $("#provisioner_settings").show('slow');
            }else if(event.target.text === "DevOps Tool"){
                $("#devops_settings").show('slow');
            }else if(event.target.text === "Post-Processor"){
                $("#postprocessor_settings").show('slow');
            }
        },

        advCollapseBtn: function(e){
            $(".adv_tab")[0].click();
        },

        loadPackedImage: function(event){
            this.popForm(event.target.id);
        },

        popForm: function(doc_id){
           var pi = this.packed_images.find(function(model) { return model.get('doc_id') === doc_id; });
           var base_image = pi.attributes.base_image;
           $('#image_template_name_input').hide().show('slow').val(base_image.name);
           $('#image_template_desc_input').hide().show('slow').val(base_image.description);
           $('input:checkbox').removeAttr('checked');
           $('#os_toggle').removeClass('active');
           $('#aws_toggle').removeClass('active');
           $("#aws_well").hide('fast');
           $("#os_well").hide('fast');
           for(var i in base_image.clouds){
               if(base_image.clouds[i] === 'aws'){
                   $('#clouds_select_aws').prop('checked', true);
                   $("#aws_toggle").toggleClass('active');
                   $("#aws_well").show('fast');
               }else if(base_image.clouds[i] === 'openstack'){
                   $('#clouds_select_openstack').prop('checked', true);
                   $("#os_toggle").toggleClass('active');
                   $("#os_well").show('fast');
               }
           }
           $('#os_input').hide().show('slow').val(base_image.os);

           $("#instance_type_select").hide().show('slow').val(base_image.machine_type);
           $("#image_type_select").hide().show('slow').val(base_image.builder_type);
           $("#image_config_management_select").hide().show('slow').val(base_image.provisioner);
           $("#dev_ops_select").hide().show('slow').val(base_image.devops_tool);
           $("#post_processor_select").hide().show('slow').val(base_image.post_processor);
           $("#openstack_type_select").hide().show('slow').val(base_image.builder_type_os);

           this.toggleComponents();

           $.ajax({
             url: Common.apiUrl + "/stackstudio/v1/packed_images/templates/" + sessionStorage.org_id + "/" + doc_id,
             async: false,
             success: function(data) {
                 pi.attributes.packed_image = data;
             }
           });

           this.builderSelect();
           this.provisionerSelect();
           this.devopsSelect();
           this.postProcessorSelect();
           this.openstackTypeSelect();
        },

        mapAdvanced: function(key,doc_id){
            //debugger
            var pi = this.packed_images.find(function(model) { return model.get('doc_id') === doc_id; });
            if(pi){
                var list = pi.attributes.packed_image[key];
                for(var i in list){
                    for(var k in list[i]){
                        if(k === "type" && key !== 'post-processors'){
                            //do nothing
                        }else if(k==="qemu"){
                            for(var kQ in list[i][k]){
                                if($("#"+kQ).attr('type') === 'checkbox'){
                                    $("#"+kQ).prop('checked',list[i][k]);
                                }else if($("#"+kQ).attr('data-type') && $("#"+kQ).attr('data-type').indexOf("array") !== -1){
                                    var id = $("#"+kQ).attr('name');
                                    var placeholder = $("#"+id).attr('placeholder');
                                    var title = $("#"+id).attr('title');
                                    var dataType = $("#"+id).attr('data-type');
                                    $("#"+kQ).val(list[i][k][kQ][0]);
                                    for(var j=1;j<list[i][k][kQ].length;j++){
                                        $( "<br/><input name='"+id+"' placeholder='"+placeholder+"' title='"+title+"' data-type='"+dataType+"' style='margin-top: 4px;' type='text' class='input-xlarge'></input>" ).insertAfter( $("#"+id).next('a') ).val(list[i][k][kQ][j]);
                                    }
                                }
                                else{
                                    $("#"+kQ).val(list[i][k][kQ]);
                                }
                            }
                        }else if($("#"+k).attr('type') === 'checkbox'){
                            $("#"+k).prop('checked',list[i][k]);
                        }else if($("#"+k).attr('data-type') && $("#"+k).attr('data-type').indexOf("array") !== -1){
                            var id1 = $("#"+k).attr('name');
                            var placeholder1 = $("#"+id1).attr('placeholder');
                            var title1 = $("#"+id1).attr('title');
                            var dataType1 = $("#"+id1).attr('data-type');
                            $("#"+k).val(list[i][k][0]);
                            for(var j1=1;j1<list[i][k].length;j1++){
                                $( "<br/><input name='"+id1+"' placeholder='"+placeholder1+"' title='"+title1+"' data-type='"+dataType1+"' style='margin-top: 4px;' type='text' class='input-xlarge'></input>" ).insertAfter( $("#"+id1).next('a') ).val(list[i][k][j1]);
                            }
                        }
                        else if(k !== "mciaas_files"){
                            $("#"+k).val(list[i][k]);
                        }
                    }
                }
            }
        },

        saveButton: function(e){
            if(this.validate()){
                this.packImage();
            }
        },

        packImage: function(){
            //base_image
            var base_image = {};

            var clouds = [];
            if($("#os_toggle").hasClass('active')){
                clouds.push('openstack');
            }
            if($("#aws_toggle").hasClass('active')){
                clouds.push('aws');
            }
            //$("input[name='clouds_select']:checkbox:checked").each(function(){  clouds.push($(this).val());   });

            base_image.name = $('#image_template_name_input').val();
            base_image.description = $('#image_template_desc_input').val();
            base_image.clouds = clouds;
            base_image.os = $('#os_input').val();

            base_image.machine_type = $("#instance_type_select").val();
            base_image.builder_type = $("#image_type_select").val();
            base_image.provisioner = $("#image_config_management_select").val();
            base_image.devops_tool = $("#dev_ops_select").val();
            base_image.post_processor = $("#post_processor_select").val();
            base_image.builder_type_os = $("#openstack_type_select").val();

            var packed_image = this.map_base(base_image);

            var builder = {};
            $("#builder_settings :input").each(function() {
                if($( this ).val().length === 0){
                    //dont add
                }else if($(this).attr('type') === 'checkbox'){
                    builder[$(this).attr('name')] = $( this ).is(':checked');
                }else if($(this).attr('type') === 'number' && isNaN($( this ).val())){
                    builder[$(this).attr('name')] = parseInt($( this ).val(),10);
                }else if($(this).attr('data-type').indexOf("array") !== -1){
                    if(builder[$(this).attr('name')] === undefined){
                        builder[$(this).attr('name')] = [$( this ).val()];
                    }else{
                        builder[$(this).attr('name')].push($( this ).val());
                    }
                }else{
                    builder[$(this).attr('name')] = $( this ).val();
                }
            });

            var builderOS = {};
            $("#openstack_settings :input").each(function() {
                if($( this ).val().length === 0){
                    //dont add
                }else if($(this).attr('type') === 'checkbox'){
                    builderOS[$(this).attr('name')] = $( this ).is(':checked');
                }else if($(this).attr('type') === 'number' && isNaN($( this ).val())){
                    builderOS[$(this).attr('name')] = parseInt($( this ).val(),10);
                }else if($(this).attr('data-type').indexOf("array") !== -1){
                    if(builderOS[$(this).attr('name')] === undefined){
                        builderOS[$(this).attr('name')] = [$( this ).val()];
                    }else{
                        builderOS[$(this).attr('name')].push($( this ).val());
                    }
                }else{
                    builderOS[$(this).attr('name')] = $( this ).val();
                }
            });

            var provisioner = {};
            if($("#image_config_management_select").val() !== "None"){
                provisioner['type'] = $("#image_config_management_select").val();
                $("#provisioner_settings :input").each(function() {
                    if($( this ).val().length === 0){
                        //dont add
                    }else if($(this).attr('type') === 'checkbox'){
                        provisioner[$(this).attr('name')] = $( this ).is(':checked');
                    }else if($(this).attr('type') === 'number' && isNaN($( this ).val())){
                        provisioner[$(this).attr('name')] = parseInt($( this ).val(),10);
                    }else if($(this).attr('data-type').indexOf("array") !== -1){
                        if(provisioner[$(this).attr('name')] === undefined){
                            provisioner[$(this).attr('name')] = [$( this ).val()];
                        }else{
                            provisioner[$(this).attr('name')].push($( this ).val());
                        }
                    }else{
                        provisioner[$(this).attr('name')] = $( this ).val();
                    }
                });
            }

            var devopsP = {};
            if($("#dev_ops_select").val() !== "None"){
                devopsP['type'] = $("#dev_ops_select").val();
                $("#devops_settings :input").each(function() {
                    if($( this ).val().length === 0){
                        //dont add
                    }else if($(this).attr('type') === 'checkbox'){
                        devopsP[$(this).attr('name')] = $( this ).is(':checked');
                    }else if($(this).attr('type') === 'number' && isNaN($( this ).val())){
                        devopsP[$(this).attr('name')] = parseInt($( this ).val(),10);
                    }else if($(this).attr('data-type').indexOf("array") !== -1){
                        if(devopsP[$(this).attr('name')] === undefined){
                            devopsP[$(this).attr('name')] = [$( this ).val()];
                        }else{
                            devopsP[$(this).attr('name')].push($( this ).val());
                        }
                    }else{
                        devopsP[$(this).attr('name')] = $( this ).val();
                    }
                });
            }

            var postProcessor = {};
            if($("#post_processor_select").val() !== "None"){
                $("#postprocessor_settings :input").not("#qemu-well :input").each(function() {
                    if($( this ).val().length === 0){
                        //dont add
                    }else if($(this).attr('type') === 'checkbox'){
                        postProcessor[$(this).attr('name')] = $( this ).is(':checked');
                    }else if($(this).attr('type') === 'number' && isNaN($( this ).val())){
                        postProcessor[$(this).attr('name')] = parseInt($( this ).val(),10);
                    }else if($(this).attr('data-type').indexOf("array") !== -1){
                        if(postProcessor[$(this).attr('name')] === undefined){
                            postProcessor[$(this).attr('name')] = [$( this ).val()];
                        }else{
                            postProcessor[$(this).attr('name')].push($( this ).val());
                        }
                    }else{
                        postProcessor[$(this).attr('name')] = $( this ).val();
                    }
                });
                postProcessor['type'] = $("#post_processor_select").val();
                postProcessor['qemu'] = {};
                $("#qemu-well :input").each(function() {
                    if($( this ).val().length === 0){
                        //dont add
                    }else if($(this).attr('type') === 'checkbox'){
                        postProcessor['qemu'][$(this).attr('name')] = $( this ).is(':checked');
                    }else if($(this).attr('type') === 'number' && isNaN($( this ).val())){
                        postProcessor['qemu'][$(this).attr('name')] = parseInt($( this ).val(),10);
                    }else if($(this).attr('data-type').indexOf("array") !== -1){
                        if(postProcessor['qemu'][$(this).attr('name')] === undefined){
                            postProcessor['qemu'][$(this).attr('name')] = [$( this ).val()];
                        }else{
                            postProcessor['qemu'][$(this).attr('name')].push($( this ).val());
                        }
                    }else{
                        postProcessor['qemu'][$(this).attr('name')] = $( this ).val();
                    }
                });
            }

            if(!$.isEmptyObject(builder)){
                for(var awsI in packed_image.builders){
                    if(packed_image.builders[awsI].type === "amazon-ebs" || packed_image.builders[awsI].type === "amazon-ami"){
                        $.extend( packed_image.builders[awsI], builder );
                    }
                }
            }
            if(!$.isEmptyObject(builderOS)){
                for(var osI in packed_image.builders){
                    if(packed_image.builders[osI].type === "qemu"){
                        $.extend( packed_image.builders[osI], builderOS );
                    }
                }
            }
            if(!$.isEmptyObject(provisioner)){
                packed_image.provisioners.push(provisioner);
            }
            if(!$.isEmptyObject(devopsP)){
                packed_image.provisioners.push(devopsP);
            }
            if(!$.isEmptyObject(postProcessor)){
                packed_image['post-processors'].push(postProcessor);
            }

            //packed_image = this.getDefaultTemplate();
            // p = this.getDefaultTemplate();
//             p.builders.push(packed_image.builders[0]);
//             packed_image = p;
//             delete packed_image.builders[1]['tags'];
//             debugger

            var id = this.currentImageTemplate;

            this.currentImageTemplate = new PackedImage({'packed_image':packed_image,'name':base_image.name,'base_image':base_image,'doc_id':id});
            this.currentImageTemplate.save();
        },

        deployImage: function(){
            var doc_id = this.currentImageTemplate;
            var pi = this.packed_images.find(function(model) { return model.get('doc_id') === doc_id; });
            pi.deploy();
        },

        deleteImage: function(){
            var doc_id = this.currentImageTemplate;
            var pi = this.packed_images.find(function(model) { return model.get('doc_id') === doc_id; });
            pi.destroy();
        },

        map_base: function(base){
            var builders = [];
            var provisioners = [];
            var postProcessors = [];
            var mappings;
            var qMap;
            $.ajax({
              url: '/samples/awsImages.json',
              async: false,
              success: function(data) {
                mappings = data;
              }
            });
            $.ajax({
              url: '/samples/imageISO.json',
              async: false,
              success: function(data) {
                qMap = data;
              }
            });
            for (var i in base.clouds) {
                if(base.clouds[i] === 'aws'){
                    for(var j in mappings){
                        if(mappings[j].label === $('#os_input').val()){
                            var aws = {
                                        "type": $("#image_type_select").val(),
                                        "access_key": $("#aws_cred_select option:selected").attr('data-ak'),
                                        "secret_key": $("#aws_cred_select option:selected").attr('data-sk'),
                                        "region": $("#aws_region_select").val(),
                                        'source_ami' : mappings[j].region[$("#aws_region_select").val()],
                                        "instance_type": $("#instance_type_select").val(),
                                        "ssh_username": "ubuntu",
                                        "ami_name": $("#image_template_name_input").val()
                                       };
                            builders.push(aws);
                        }
                    }
                }
                if(base.clouds[i] === 'openstack'){
                    var qHash = {};//this.getDefaultTemplate()['builders'][0];
                    qHash['type'] = $("#openstack_type_select").val();
                    qHash['iso_checksum'] = qMap[$('#os_input').val()]['checksum'];
                    qHash['iso_url'] = qMap[$('#os_input').val()]['url'];
                    qHash['name'] = $("#image_template_name_input").val();
                    builders.push(qHash);
                }
            }

            return {'builders':builders,'provisioners':provisioners, 'post-processors':postProcessors};
        },

        getDefaultTemplate: function(){
            var mappings;
            $.ajax({
              url: '/samples/packer-ubuntu-12.json',
              async: false,
              success: function(data) {
                mappings = data;
              }
            });
            return mappings;
        },

        uploadAsync: function(){
            var d_id = this.currentImageTemplate;
            var upUrl = Common.apiUrl + "/stackstudio/v1/packed_images/save?uid=" + sessionStorage.org_id + "&docid=" + d_id;
            $("#upForm").attr('action',upUrl);
            if($("#mciaas_files").val() !== ""){
                $("#upSub").click();
            }
        },

        appendButton: function(e){
            var id = e.target.getAttribute('data-name');
            var placeholder = $("#"+id).attr('placeholder');
            var title = $("#"+id).attr('title');
            var dataType = $("#"+id).attr('data-type');
            $( "<br/><input name='"+id+"' placeholder='"+placeholder+"' title='"+title+"' data-type='"+dataType+"' style='margin-top: 4px;' type='text' class='input-xlarge'></input>" ).insertAfter( e.target ).hide().show('fast');
            //debugger
        },

        validate: function(){
            var valid = true;
            $("#os_input_msg").empty();
            $("#clouds_select_msg").empty();
            $("#os_input").css('border-color','grey');
            $("#image_template_name_input").css('border-color','grey');
            if($("#os_toggle").hasClass('active')){
                if($("#os_input").val().indexOf("Amazon") !== -1){
                    $("#os_input").css('border-color','red');
                    $("#os_input_msg").html("Amazon Linux not compatible with OpenStack");
                    valid = false;
                }else if($("#os_input").val().indexOf("Red Hat") !== -1){
                    $("#os_input").css('border-color','red');
                    $("#os_input_msg").html("Red Hat not compatible with OpenStack, try CentOS or Fedora");
                    valid = false;
                }
            }
            if($("#image_template_name_input").val()===""){
                $("#image_template_name_input").css('border-color','red');
                valid = false;
            }
            //var clouds = [];
            //$("input[name='clouds_select']:checkbox:checked").each(function(){  clouds.push($(this).val());   });
            if(!$("#os_toggle").hasClass('active') && !$("#aws_toggle").hasClass('active')){
                $("#clouds_select_msg").html("Must choose a cloud");
                valid = false;
            }
            return valid;
        },

        cloudSelect: function(e){
            //debugger
            var aref = $(e.target).closest("a")[0];
            if(aref.id === "os_toggle"){
                $("#os_well").toggle('slow');
                $("#os_toggle").toggleClass('active');
                $("#openstack_type_select").prop('disabled', !$("#os_toggle").hasClass('active'));
            }else if(aref.id === "aws_toggle"){
                $("#aws_well").toggle('slow');
                $("#aws_toggle").toggleClass('active');
                $("#image_type_select").prop('disabled', !$("#aws_toggle").hasClass('active'));
                $("#aws_cred_select").prop('disabled', !$("#aws_toggle").hasClass('active'));
                $("#aws_region_select").prop('disabled', !$("#aws_toggle").hasClass('active'));
            }
            this.toggleComponents();
            this.validate();
        },

        clearForm: function(){
            $("#image_template_name_input").val('');
            $("#image_template_desc_input").val('');
            // $("#clouds_select_aws").prop('checked',false);
//             $("#clouds_select_openstack").prop('checked',false);
            $(".cloud-button").removeClass('active');
            $("#image_type_select").val('None');
            $("#openstack_type_select").val('None');
            $("#os_input").val('');

            $("#image_config_management_select").val('None');
            $("#dev_ops_select").val('None');
            $("#post_processor_select").val('None');

            $("#builder_settings").empty();
            $("#openstack_settings").empty();
            $("#provisioner_settings").empty();
            $("#devops_settings").empty();
            $("#postprocessor_settings").empty();

            //this.toggleComponents();
        },

        toggleComponents: function(){
            if(!$("#os_toggle").hasClass('active') && !$("#aws_toggle").hasClass('active')){
                $("#instance_well").hide('fast');
                $("#components_well").hide('fast');
            }else{
                $("#instance_well").show('fast');
                $("#components_well").show('fast');
            }
        },

        keyUp: function(e){
            this.validate();
        },

        selectChange: function(e){
            this.refreshTabs();
        },

        refreshTabs: function(){
            this.refTab($("#image_type_select").val(),$("#builder_tab"));
            this.refTab($("#openstack_type_select").val(),$("#openstack_tab"));
            this.refTab($("#image_config_management_select").val(),$("#provisioner_tab"));
            this.refTab($("#dev_ops_select").val(),$("#devops_tab"));
            this.refTab($("#post_processor_select").val(),$("#postprocessor_tab"));
        },

        refTab: function(selector,tab){
            if(selector==="None"){
                tab.hide('fast');
            }else{
                tab.show('fast');
            }
        },

        closeImageTemplate: function() {
            this.currentImageTemplate = undefined;
            this.render();
        },

        close: function(){
            this.$el.empty();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
        }
    });

    var imagesView;

    Common.router.on('route:images', function (id) {
        if(sessionStorage.account_id) {
            if (this.previousView !== imagesView) {
                this.unloadPreviousState();
                imagesView = new ImagesView();
                this.setPreviousState(imagesView);
            }
            imagesView.currentImageTemplate = id;
            imagesView.render();
        }else {
            Common.router.navigate("", {trigger: true});
            Common.errorDialog("Login Error", "You must login.");
        }
    }, Common);

	return ImagesView;
});
