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
        'text!templates/compute/instanceCreateTemplate.html',
        'models/compute/instance',
        'icanhaz',
        'common',
        'jquery.ui.selectmenu',
        'jquery.multiselect',
        'jquery.multiselect.filter'
        
], function( $, _, Backbone, instanceCreateTemplate, instance, ich, Common ) {
    
    var imageList = [{"logo":"aws", "label":"Amazon Linux AMI 2012.09", "id":"ami-123456", "description":"EBS-backed PV-GRUB image. Includes: MySQL, PostgreSQL, Python, Ruby, and Tomcat."},
                     {"logo":"redhat", "label":"Red Hat Enterprise Linux 6.3", "id":"ami-234567", "description":"Red Hat Enterprise Linux version 6.3, EBS-boot."},
                     {"logo":"suse", "label":"SUSE Linux Enterprise Server 11", "id":"ami-345678", "description":"EBS boot with Amazon EC2 AMI Tools preinstalled; Apache 2.2, MySQL 5.0, PHP 5.3, and Ruby "}];
    
    var azList = ["us-east-1a", "us-east-1b", "us-east-1d"];
    
    var machineSizes = ["Micro Instance", "Small Instance", "Medium Instance", "Large Instance", "Extra Large Instance"];
    
    var keyPairs = ["bjones", "cstewart", "jgardner"];
    
    var securityGroups = ["default", "dev", "elasticbeanstalk-default", "ChefServer-ChefClientSecurityGroup-N1W9603CQT1Q"];
    
    /**
     * InstanceCreateView is UI form to create instance.
     *
     * @name InstanceCreateView
     * @constructor
     * @category Compute
     * @param {Object} initialization object.
     * @returns {Object} Returns a InstanceCreateView instance.
     */
    
    var InstanceCreateView = Backbone.View.extend({
        
        tagName: "div",
        
        // Delegated events for creating new instances, etc.
        events: {
            "focus #image_combo_box": "openImageList",
            "dialogclose": "close",
            "change #radio": "elasticityChange"
        },

        initialize: function() {
            var createView = this;
            var compiledTemplate = _.template(instanceCreateTemplate);
            this.$el.html(compiledTemplate);

            this.$el.dialog({
                autoOpen: true,
                title: "Create Instance",
                width:500,
                minHeight: 150,
                resizable: false,
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
            
            $("#accordion").accordion();
            
            $("#image_combo_box").autocomplete({
                source: imageList,
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
                }
                var img = '<td style="width:22px;" rowspan="2"><img height="20" width="20" src="'+imagePath+'"/></td>';
                var name = '<td>'+item.label+'</td>';
                var description = '<td>'+item.description+'</td>';
                var imageItem = '<a><table stlye="min-width:150px;"><tr>'+ img + name + '</tr><tr>' + description + '</tr></table></a>';
                return $("<li>").data("item.autocomplete", item).append(imageItem).appendTo(ul);
            };
            
            $.each(azList, function (index, value) {
                console.log("Adding " + value + " to az_select");
                $('#az_select')
                    .append($("<option></option>")
                    .attr("value",index)
                    .text(value)); 
            });
            $("#az_select").selectmenu();
           
            $.each(machineSizes, function (index, value) {
                console.log("Adding " + value + " to size_select");
                $('#size_select')
                    .append($("<option></option>")
                    .attr("value",index)
                    .text(value)); 
            });
            $("#size_select").selectmenu();
            
            $.each(keyPairs, function (index, value) {
                console.log("Adding " + value + " to key_pair_select");
                $('#key_pair_select')
                    .append($("<option></option>")
                    .attr("value",index)
                    .text(value)); 
            });
            $("#key_pair_select").selectmenu();
            
            $.each(securityGroups, function (index, value) {
                console.log("Adding " + value + " to security_group_select");
                $('#security_group_select')
                    .append($("<option></option>")
                    .attr("value",index)
                    .text(value)); 
            });
            $("#security_group_select").multiselect({
                    selectedList: 3,
                    noneSelectedText: "Select Security Group(s)"
            }).multiselectfilter();
            
            $("#radio").buttonset();
        },

        render: function() {
            
        },
        
        openImageList: function() {
            if($("ul.ui-autocomplete").is(":hidden")) {
                $("#image_combo_box").autocomplete("search", "");
            }
        },
        
        elasticityChange: function () {
            switch($("input[name=radio]:checked").val())
            {
            case "none":
                console.log("none selected");
                $("#elasticity_image").attr("src", "/images/IconPNGs/NewServer.png");
                var noneHTML = "";
                $("#elasticity_config").html(noneHTML);
                break;
            case "autoRecovery":
                console.log("auto recover selected");
                $("#elasticity_image").attr("src", "/images/IconPNGs/Autorestart.png");
                var autoRecoveryHTML = "";
                $("#elasticity_config").html(autoRecoveryHTML);
                break;
            case "fixedArray":
                console.log("fixed array selected");
                $("#elasticity_image").attr("src", "/images/IconPNGs/Autoscale.png");
                var fixedArrayHTML = "<table><tr><td>Size:</td><td><input id='fixedArraySize'/></td></tr></table>";
                $("#elasticity_config").html(fixedArrayHTML);
                break;
            case "autoScale":
                console.log("auto scale selected");
                $("#elasticity_image").attr("src", "/images/IconPNGs/Autoscale.png");
                var autoScaleHTML = "<table>" +
                        "<tr><td>Min:</td><td><input id='asMin'/></td></tr>" +
                        "<tr><td>Max:</td><td><input id='asMax'/></td></tr>" +
                        "<tr><td>Desired Capacity:</td><td><input id='asDesiredCapacity'/></td></tr>" +
                        "</table>";
                $("#elasticity_config").html(autoScaleHTML);
                break;
            }
        },
        
        close: function() {
            console.log("close initiated");
            $("#accordion").remove();
            $("#image_combo_box").remove();
            $("#az_select").remove();
            $("#size_select").remove();
            $("#key_pair_select").remove();
            $("#security_group_select").remove();
            this.$el.dialog('close');
        },
        
        cancel: function() {
            this.$el.dialog('close');
        },
        
        create: function() {
            console.log("create_initiated");
            //Validate and create
            this.$el.dialog('close');
        }
    });

    console.log("instance create view defined");
    
    return InstanceCreateView;
});
