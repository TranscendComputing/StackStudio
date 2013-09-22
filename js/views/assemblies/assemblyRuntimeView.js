/*
TODO LIST:
- Add Enable/Disable for infra checkboxes
- Need a way to determine whether chef, puppet, or cloudFormation are configured before displaying
- Wire up deployment buttons (when services available)

- Add mechanism for ordering chef run-list

*/


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
        'icanhaz',
        'common',
        'typeahead', // Not an AMD component!
        'text!templates/assemblies/assemblyRuntimeTemplate.html',
        'collections/apps',
        'collections/cloudCredentials',
        'collections/cookbooks',
        'collections/chefEnvironments',
        'views/assemblies/appListView',
        'models/app',
        'jquery-plugins',
        'jquery-ui-plugins',
        'jquery.dataTables',
        'jquery.dataTables.fnProcessingIndicator',
        'jquery.sortable'
], function( $, _, bootstrap, Backbone, ich, Common, typeahead, appsTemplate, Apps, CloudCredentials, Cookbooks, ChefEnvironments, AssemblyRuntimeListView, App ) {
	// The Assembly Runtime View
	// ------------------------------

    /**
     * Assembly Runtime is UI view of configurations to be added to running instances.
     *
     * @name AssemblyRuntimeView
     * @constructor
     * @category Apps
     * @param {Object} initialization object.
     * @returns {Object} Returns a AssemblyRunTimeView project.
     */
    var AssemblyRuntimeView = Backbone.View.extend({
        id: 'assembly_runtime_view',

        //className: [''],

        template: _.template(appsTemplate),

        cloudProvider: undefined,

        appsApp: undefined,

        chefIcon: "<img src='/images/CompanyLogos/chefLogo.jpg' class='chef_icon'/>",
        puppetIcon: "<img src='/images/CompanyLogos/puppet.png' class='puppet_icon'/>",

        subViews: [],

        events: {
            "change #chefEnvironmentSelect" : "environmentSelectHandler",
            "change #deploy-inst table:first" : "updateDeployButtonState",
            "click #deploy-to" : "queueToInstance",
            "change #assemblyRuntimeTool": "toolChangeHandler"
        },


        initialize: function(options) {
            console.log("Initialize assembly runtime view.");
            if (!_.compile){ // Allows using underscore templating with tyepahead
                _.compile = function(templ) {
                  var compiled = this.template(templ);
                  compiled.render = function(ctx) {
                     return this(ctx);
                  };
                  return compiled;
               };
            }
            $("#assemblyRuntime").html(this.el);
            this.$el.html(this.template);
            this.bind("badge-refresh", this.updateDeployButtonState, this);

            this.populateToolMenu();

            Common.vent.on("chefSelectionChanged", this.updateDeployButtonState, this);
            Common.vent.on("puppetSelectionChanged", this.updateDeployButtonState, this);

            this.instanceTable = $('#deploy-inst table:first').dataTable({
                "bJQueryUI": true,
                "bProcessing": true,
                "bDestroy": true,
                bRetrieve: true,
                "aoColumnDefs": [
                    {
                        "sTitle": "",
                        aTargets: [0],
                        mData: function(instance){
                            return "<input type='checkbox' data-instance-id='" + instance.id + "'></input>";
                        }
                    },
                    {
                        "sTitle": "",
                        aTargets: [1],
                        mData: function(instance){
                            return "";
                        }
                    },
                    {
                        "sTitle": "Instance Name",
                        aTargets: [2],
                        //mData: "tags.Name"
                        mData: function(instance){
                            if (!instance){
                                return "";
                            }
                            if (instance.name){
                                return instance.name;
                            }
                            return instance.tags ? (instance.tags.Name ? instance.tags.Name : "") : "";
                        }
                    },
                    {
                        "sTitle": "Id",
                        aTargets: [3],
                        mData: "id"
                    }
                ]
            });
            this.instanceTable.fnProcessingIndicator(true);
            this.listView = options.listView;
            this.listView.render();
            this.render();
        },
        render: function () {

            this.cloudCredentials = new CloudCredentials();
            this.cloudCredentials.on('reset', this.populateCredentials, this);

            var $this = this;
            this.fetchCloudDefinitions().done($.proxy(function(result){
                $this.cloudDefinitions = result;
                $this.loadCredentials();
            }, this));
        },

        toolChangeHandler: function(evt){
            $(".main-group").hide();
            $("#no_tool_selected").hide();
            $("#tool_selected").show();
            var currentTool = $(evt.currentTarget).val().toLowerCase();
            var accordion = $("#" + currentTool + "Accordion");
            accordion.show();
        },
        populateToolMenu: function(){
            var menu = $("#assemblyRuntimeTool");
            menu.empty();
            menu.append('<option value="Chef">Chef</option>');
            menu.append('<option value="Puppet">Puppet</option>');
            menu.get(0).value = "";
        },

        environmentSelectHandler: function(evt){
            this.listView.environmentSelectHandler(evt);
        },

        fetchCloudDefinitions: function(){
            var d = $.Deferred();
            var $this = this;
            $.ajax({
                url: "samples/cloudDefinitions.json" //TODO: this could be a real model, but it's so simple...
            }).done(function(model){
                d.resolve(model);
            }).fail(function(){
                $this.flashError("We're sorry.  Cloud Formation Templates could not be retrieved.");
                d.reject();
            });
            return d.promise();
        },

        populateRegions: function(credential){
            var select = $("#select-region")
                .empty()
                .on("change", $.proxy(this.regionChanged, this));
            var provider = this.cloudDefinitions[credential.get("cloud_provider").toLowerCase()];
            $.each(provider.regions, function(index, element){
                $('<option>')
                    .val(element.zone)
                    .text(element.name)
                    .data("region", element)
                    .data("credential", credential)
                    .appendTo(select);
            });
            select.trigger("change");
        },

        credentialChangeHandler: function(evt){
            var $this = this;
            var optionSelected = $("option:selected", evt.target);
            var credential = this.credential = optionSelected.data("cloudCredentials");
            if (!credential){
                this.flashError("We're sorry.  Cloud credentials could not be retrieved.");
                return;
            }

            this.populateRegions(credential);
            this.listView.credential = credential;
            this.listView.fetchChefEnvironments().done(function(model){
                $this.populateChefEnvironments(new ChefEnvironments(model));
            });
            this.listView.populatePuppetClasses();
        },

        populateChefEnvironments: function(list){
            var select = $("#chefEnvironmentSelect").empty();
            $("<option value='' disabled selected style='display:none;'>Select Environment</option></select>").appendTo(select);
            list.forEach(function(element, index, list){
                $("<option value='" + element.get("name") + "'>" + element.get("name") + "</option></select>").appendTo(select);
            });
        },

        populateCredentials: function(list, options){
            var select = $("#select-credentials")
                .empty()
                .on("change", $.proxy(this.credentialChangeHandler, this));
            list.forEach(function(element, index, list){
                $('<option>')
                    .text(element.get("cloud_name") + ":" + element.get("name"))
                    .data("cloudCredentials", element)
                    .appendTo(select);
            });
            select.trigger("change");
        },

        regionChanged: function(evt){
            var optionSelected = $("option:selected", evt.target);
            var region = optionSelected.data("region");
            var credential = optionSelected.data("credential");
            this.populateInstances(region, credential);
        },

        populateInstances: function(region, credential) {
            var $this = this;
            var providerName = credential.get("cloud_provider").toLowerCase();
            var appPath = "../" + providerName + "/collections/compute/" + providerName + "Instances";
            require([appPath], function(Instances) {
                var instances = new Instances();

                instances
                    .fetch({
                        data: {
                            cred_id: credential.get("id"),
                            region: region.zone
                        },
                        success: function(collection, response, options) {
                            $this.renderInstances(collection.toJSON());
                            $this.labelInstances(collection.toJSON());
                        }
                    });
            });
        },
        labelInstances: function(instances) {
            var instanceInfo = [];
            var cloud = this.credential.get("cloud_provider").toLowerCase();
            var accountId = this.credential.get("cloud_account_id");
            var chefApiUrl = Common.apiUrl + "/stackstudio/v1/orchestration/chef/nodes/find?account_id=" + accountId;
            var puppetApiUrl = Common.apiUrl + "/stackstudio/v1/orchestration/puppet/agents/find?account_id=" + accountId;

            for (var i = 0; i < instances.length; i++) {
                var name = instances[i]["name"] || instances[i]["dns_name"];
                var ipAddrs = [];
                if(cloud === "aws"){
                    ipAddrs.push(instances[i]["private_ip_address"]);
                    ipAddrs.push(instances[i]["private_ip_address"]);
                }else if(cloud === "openstack"){
                    //TODO: Add compatibility to non-Grizzly openstack
                    var addresses = instances[i]["addresses"];
                    for(var network in addresses){
                        if(addresses.hasOwnProperty(network)){
                            for(var j = 0; j < addresses[network].length; j++){
                                ipAddrs.push(addresses[network][j]["addr"]);
                            }
                        }
                    }
                }
                instanceInfo.push({"name": name, "ip_addresses": ipAddrs});
            }
            this.matchInstancesAjax(instanceInfo, this.chefIcon, chefApiUrl, "node");
            this.matchInstancesAjax(instanceInfo, this.puppetIcon, puppetApiUrl, "agent");
        },
        matchInstancesAjax: function(instances, icon, url, type){
            $.ajax({
                url: url,
                type: "POST",
                data: JSON.stringify(instances),
                success: function(response) {
                    for(var i = 0; i < response.length; i++){
                        var data = response[i];
                        if(!$.isEmptyObject(data)){
                            var instanceRow = this.instanceTable.$("tr:eq("+i+")").first();
                            instanceRow.data(type, data);
                            instanceRow.find("td:eq(1)").html(icon);
                        }
                    }
                },
                context: this
            });
        },

        updateDeployButtonState: function(data){
            var instanceChecked = $("#deploy-inst table:first input[type='checkbox']:checked").length;
            var infraChecked = $("#cloud-formation-badge input[type='checkbox']:checked").length;

            var configsList = this.listView.getConfigs("#assemblyRuntimeTool")["configurations"];
            var tool = $("#assemblyRuntimeTool").val();


            var enabled;
            var selectedLength;
            if(instanceChecked){
                switch(tool)
                {
                    case "Chef":
                        selectedLength = $("#chef-selection").find("input[type='checkbox']:checked").length;
                        enabled = selectedLength !==0 || configsList["chef"]["run_list"].length !==0;
                        break;
                    case "Puppet":
                        selectedLength = $("#puppet-selection").find("input[type='checkbox']:checked").length;
                        enabled = (selectedLength !==0|| configsList["puppet"]["node_config"].length !==0 );
                        break;
                }
            }
            if (enabled){
                $("#deploy-to")
                    .removeClass("disabled")
                    .prop("disabled", false);
            } else {
                $("#deploy-to")
                    .addClass("disabled")
                    .prop("disabled", true);
            }

            var newInstance = $("#cloud-formation-accordion-group input[type='checkbox']:checked").length;
            if (newInstance){
                $("#launch")
                    .removeClass("disabled")
                    .prop("disabled", false);
            } else {
                $("#launch")
                    .addClass("disabled")
                    .prop("disabled", true);
            }
        },

        renderInstances: function(instances){
            this.instanceTable.fnClearTable();
            this.instanceTable.fnAddData(instances);
            this.instanceTable.fnProcessingIndicator(false);
            this.updateDeployButtonState();
        },

        loadCredentials: function(){
            this.cloudCredentials.fetch({
                reset: true
            });
        },

        disableDeployLaunch: function(){
            $("#deploy-launch").addClass("disabled");
            this.updateDeployButtonState();
        },

        enableDeployLaunch: function(){
            $("#deploy-launch").removeClass("disabled");
        },

        // queueToInstance: function(evt){
        //     var $this = this;

        //     var configSelection = this.listView.getConfigs()["configurations"];
        //     var runlist = configSelection["chef"]["run_list"];
        //     var chefEnv = configSelection["chef"]["env"];

        //     var nodeConfig = configSelection["puppet"];
        //     var checked = this.instanceTable.$("input[type=checkbox]:checked");
        //     checked.each(function(index, checkbox){
        //         var row = $(checkbox).parents()[1];
        //         var nodeData = $(row).data()["node"];
        //         if(nodeData){
        //             $this.addToRunlist(nodeData["name"], runlist);
        //         }
        //     });

        // },
        queueToInstance: function(evt) {
            var $this = this;
            var accountId = this.credential.get("cloud_account_id");
            
            var selected = this.instanceTable.$("input[type=checkbox]:checked");
            var tool = $("#assemblyRuntimeTool").val();
            var configSelection = this.listView.getConfigs("#assemblyRuntimeTool")["configurations"][tool.toLowerCase()];

            for(var i = 0; i < selected.length; i++){
                var row = $(selected[i]).parents()[1];
                var rowData = $(row).data();
                switch (tool) {
                    case "Puppet":
                        if(rowData["agent"]){
                            var id = rowData["agent"]["foreman_id"];
                            var nodeConfig = configSelection["node_config"];
                            var postData = {"puppetclass_ids":[]};
                            for(var j =0; j < nodeConfig.length; j++){
                                postData["puppetclass_ids"].push(nodeConfig[j].id);
                            }
                            this.updateInstanceConfig("puppet/agents", id, postData, "nodeConfigUpdated");

                        }
                        break;
                    case "Chef":
                        var runlist = configSelection["run_list"];
                        var env = configSelection["env"];
                        var nodeData = $(row).data()["node"];
                        if(nodeData){
                            this.updateInstanceConfig("chef/nodes", nodeData["name"], runlist, "runListUpdated");
                        }
                        break;
                }
            }
        },

        updateInstanceConfig: function(subUrl, id, data, eventName){
            var accountId = this.credential.get("cloud_account_id");
            var url = Common.apiUrl + "/stackstudio/v1/orchestration/" + subUrl + "/"+ id  +"?account_id=" + accountId + "&_method=PUT";
            $.ajax({
                url: url,
                type: "POST",
                data: JSON.stringify(data),
                success: function(response) {
                    Common.vent.trigger(eventName);
                },
                error: function(response){
                    Common.errorDialog("Server Error", "Could not update instance configuration.");
                }
            });
        },

        close: function(){
            this.$el.empty();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
        }

        // toggleInstInfra: function(ev){
        //     switch(ev.target.id)
        //     {
        //         case ("collapseConfig"):{
        //             $("#deploy-inst").show();
        //             $("#deploy-infra").hide();
        //         }break;
        //         case ("collapseInfra"):{
        //             $("#deploy-inst").hide();
        //             $("#deploy-infra").show();
        //         }break;
        //     }
        // },

        // searchClick: function(evt) {
        //     var label, clicked;
        //     clicked = $(evt.target);
        //     $("#msg").html('Perform typeahead search, in case of long list of items.');
        //     $(".alert").delay(200).addClass("in").show().fadeOut(4000);
        //     return false;
        // },

        // packageSourceClick: function(evt) {
        //     var label, clicked;
        //     $("#deploy-infra").hide();
        //     $("#deploy-inst").show();
        //     clicked = $(evt.target);
        //     clicked.parent().parent().find(".source").removeClass("active");
        //     clicked.parent().parent().find(".l2").hide();
        //     clicked.parent().find(".l2").show();
        //     return false;
        // },

        // infraSourceClick: function(evt) {
        //     var label, clicked;
        //     $("#deploy-infra").show();
        //     $("#deploy-inst").hide();
        //     clicked = $(evt.target);
        //     clicked.parent().parent().find(".infra-source").removeClass("active");
        //     clicked.parent().parent().find(".l2").hide();
        //     clicked.parent().find(".l2").show();
        //     return false;
        // },


        // deployTo: function(evt) {
        //     var message = "Deploy selected modules to the selected instances.";
        //     console.log("deploy to.", this, evt.target);

        //     $("#msg").html(message);
        //     $(".alert").delay(200).addClass("in").show().fadeOut(4000);
        // },

        // deployLaunch: function(evt) {
        //     console.log("click check.", this, evt.target);
        //     $("#msg").html('Launch "Run Instance" dialog');
        //     $(".alert").delay(200).addClass("in").show().fadeOut(4000);
        // },

    });

	return AssemblyRuntimeView;
});
