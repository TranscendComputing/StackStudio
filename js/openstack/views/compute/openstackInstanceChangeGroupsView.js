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
        'text!templates/openstack/compute/openstackInstanceChangeGroupTemplate.html',
        'openstack/models/compute/openstackInstance',
        'openstack/collections/compute/openstackSecurityGroups',
        'common',
        'spinner',
        'jquery.multiselect',
        'jquery.multiselect.filter'
], function( $, _, Backbone, DialogView, instanceCreateTemplate, Instance, SecurityGroups, Common, Spinner) {
    
    var InstanceCreateView = DialogView.extend({
        
        template: _.template(instanceCreateTemplate),

        credentialId: undefined,

        region: undefined,
        
        securityGroups: new SecurityGroups(),
        
        instance: new Instance(),
        
        // Delegated events for creating new instances, etc.
        events: {
            "focus #image_select": "openImageList",
            "dialogclose": "close"
        },

        initialize: function(options) {
            this.credentialId = options.cred_id;
            this.region = options.region;
            this.instance = options.instance;
        },

        render: function() {
            var changeGroupsView = this;
            this.$el.html(this.template);

            this.$el.dialog({
                autoOpen: true,
                title: "Change Security Groups",
                width:575,
                minHeight: 150,
                resizable: false,
                modal: true,
                buttons: {
                    Change: function () {
                        changeGroupsView.change();
                    },
                    Cancel: function() {
                        changeGroupsView.cancel();
                    }
                }
            });

            $("#instance_name").val(this.instance.get("name")).attr("disabled", true);
            this.groupSelect = $("#security_group_select").multiselect({
                selectedList: 3,
                noneSelectedText: "Select Security Group(s)"
            }).multiselectfilter();

            this.securityGroups.on( 'reset', this.addAllSecurityGroups, this );
            this.securityGroups.fetch({ data: $.param({ cred_id: this.credentialId, region: this.region }), reset: true });
            
            var spinnerOptions = {
                //lines: 13, // The number of lines to draw
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
                //top: 150,  Top position relative to parent in px
                //left: 211  Left position relative to parent in px
            };
            
            new Spinner(spinnerOptions).spin($("#instance_change_groups").get(0));
        },
        
        addAllSecurityGroups: function() {
            $("#security_group_select").empty();
            this.securityGroups.each(function(sg) {
                if(sg.attributes.name) {
                    $("#security_group_select").append($("<option></option>").text(sg.get("name")).val(sg.get("name")));
                }
            });
            $("#security_group_select").multiselect("refresh");
            this.instance.getSecurityGroups(this.credentialId, this.region);

            Common.vent.once("instanceGroupsFetched", function(groups){
                this.instanceGroups = groups.map(function(group){return group.name;});

                $(".spinner").remove();
                for(var i = 0; i < groups.length; i++){
                    $("#security_group_select option[value='"+ groups[i].name+"'").attr("selected", true);
                }
                $("#security_group_select").multiselect("refresh");
            }, this);
        },

        change: function() {
            var selected = $("#security_group_select").multiselect("getChecked")
                            .map(function(index, node){
                                return $(node).val();
                            });
            var removed = $(this.instanceGroups).not(selected).get();
            var added = $(selected).not(this.instanceGroups).get();
            var changes = {"add": added, "remove":removed};

            this.instance.changeSecurityGroups(changes, this.credentialId, this.region);

            Common.vent.once("securityGroupsChanged", function(){
                this.$el.dialog('close');
            },this);
        }
    });
    
    return InstanceCreateView;
});
