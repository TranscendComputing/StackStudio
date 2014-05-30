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
        'views/resource/resourceAppView',
        'text!templates/vcloud/compute/vcloudVappAppTemplate.html',
        '/js/vcloud/models/compute/vcloudVapp.js',
        '/js/vcloud/collections/compute/vcloudVapps.js',
        '/js/vcloud/collections/compute/vcloudVms.js',
        '/js/vcloud/views/compute/vcloudVmAppView.js',
        'text!templates/emptyGraphTemplate.html',
        'text!templates/vcloud/compute/vcloudVmListTemplate.html',
        'icanhaz',
        'common',
        'morris',
        'spinner',
        'jquery.dataTables',
        'jquery.dataTables.fnProcessingIndicator'
], function( $, _, Backbone, ResourceAppView, VCloudVappTemplate, Vapp, Vapps, Vms, VmDialogView, emptyGraph, vmListTemplate, ich, Common, Morris, Spinner ) {
    'use strict';

    var VCloudVappsAppView = ResourceAppView.extend({
        
        template : _.template(VCloudVappTemplate),

        modelStringIdentifier: "name",

        columns : ["name", "description", "deployed", "status"],

        idColumnNumber : 0,

        model : Vapp,

        collectionType : Vapps,

        type : 'compute',

        subtype : 'vapps',

        CreateView : undefined,

        UpdateView : undefined,

        events : {
            'click #resource_table tr': "loadVapp",
            'click #power_on_vapp' : "powerOn",
            'click #power_off_vapp' : "powerOff",
            'click #reboot_vapp' : "reboot",
            'click #suspend_vapp' : "suspend",
            'click #delete_vapp': "deleteVapp",
            'click #create_snapshot': "createSnapshot",
            'click #revert_to_snapshot': "revert",
            'click #remove_snapshots': "deleteSnapshots"
        },

        createButton : false,

        actions : [
          { text: "Power On", id: "power_on_vapp", type : "row" },
          { text: "Power Off", id: "power_off_vapp", type : "row" },
          { text: "Reboot", id: "reboot_vapp", type : "row" },
          { text: "Suspend", id: "suspend_vapp", type: "row" },
          { text: "Delete", id: "delete_vapp", type: "row" },
          { text: "Create Snapshot", id:"create_snapshot", type: "row" },
          { text: "Revert", id:"revert_to_snapshot", type: "row"},
          { text: "Remove Snapshots", id: "remove_snapshots", type: "row"}
        ],

        initialize : function ( options ) {
            var self = this;
            this.$el.html(this.template);

            this.parent = options.navView;

            var appView = this;
            this.vdc = options.data_center;

            options = options || {};
            this.credentialId = options.cred_id;

            this.collection = new Vapps({
                vdc_id : this.vdc,
                cred_id : this.credentialId
            });

            this.loadData({
                data : {
                    vdc_id : this.vdc
                }
            });

            this.render();

            this.loadTable();

            Common.vent.on('vappVmsLoaded', this.vmsLoaded, this);
        },

        vmsLoaded : function ( vms ) {
            var appView = this;
            var $tabs = $('#detail_tabs');

            if($('#vapp_vms').length === 0) {
                //need to keep this template for later
                var $vm_list = _.template(vmListTemplate);
                $('body').append($vm_list);
            }

            if(!ich.templates.vapp_vms) {
                ich.refresh();
            }

            var $vm_tab = ich.vapp_vms({ vms : _.pluck(vms.models, "attributes") });
            

            $vm_tab.find('tbody tr').click(function () {
                var id = $(this).attr('vm_id');
                appView.vmDialog = new VmDialogView({
                    cred_id: appView.credentialId,
                    vapp : appView.selectedVapp,
                    data_center : appView.vdc,
                    model : vms.get(id)
                });
                appView.vmDialog.render();
            });

            this.$el.find('#tabs-2').html($vm_tab);
        },

        loadVapp : function ( event ) {

            //get vms
            var id = $(event.currentTarget).data('id');
            var vms = new Vms({
                vdc_id : this.vdc,
                vapp_id : id,
                cred_id : this.credentialId
            });

            this.selectedVapp = id;

            vms.fetch({
                success : function ( vms ) {
                    Common.vent.trigger('vappVmsLoaded', vms);
                }
            });

            this.clickOne.call(this, event);
        },

        powerOn : function () {
          var vapp = this.collection.get(this.selectedVapp);

          vapp.powerOn({
            cred_id : this.credentialId,
            vdc_id : this.vdc,
            vapp_id : this.selectedVapp
          });
        },

        powerOff : function () {
          var vapp = this.collection.get(this.selectedVapp);

          vapp.powerOff({
            cred_id : this.credentialId,
            vdc_id : this.vdc,
            vapp_id : this.selectedVapp
          });
        },

        reboot : function () {
          var vapp = this.collection.get(this.selectedVapp);

          vapp.reboot({
            cred_id : this.credentialId,
            vdc_id : this.vdc,
            vapp_id : this.selectedVapp
          });
        },

        suspend : function () {
          var vapp = this.collection.get(this.selectedVapp);

          vapp.suspend({
            cred_id : this.credentialId,
            vdc_id : this.vdc,
            vapp_id : this.selectedVapp
          });
        },

        toggleActions : function () {
            //not really any actions right now
        },

        deleteVapp : function ( event ) {
            var appView = this;
            var id = this.selectedVapp;
            var vapp = this.collection.get(id);

            vapp.destroy({
                cred_id : this.credentialId,
                vapp_id : id,
                vdc_id : this.vdc,
                success : function ( result ) {
                    console.log(result);
                    appView.collection.remove(vapp);
                    appView.collection.reset(appView.collection.models);
                }
            });
        },

        createSnapshot : function ( event ) {
            var appView = this;
            var id = this.selectedVapp;
            var vapp = this.collection.get(id);

            //this will overwrite existing snapshot
            //todo: inform user of this
            vapp.createSnapshot({
                cred_id : this.credentialId,
                vdc_id : this.vdc,
                vapp_id : id
            });
        },

        revert : function ( event ) {
            var appView = this;
            var id = this.selectedVapp;
            var vapp = this.collection.get(id);

            vapp.revert({
                cred_id : this.credentialId,
                vdc_id : this.vdc,
                vapp_id : id
            });
        },

        deleteSnapshots : function ( event ) {
            var id = this.selectedVapp;
            var vapp = this.collection.get(id);

            vapp.removeSnapshots({
                cred_id : this.credentialId,
                vdc_id : this.vdc,
                vapp_id : id
            });
        }
    });

    return VCloudVappsAppView;
});