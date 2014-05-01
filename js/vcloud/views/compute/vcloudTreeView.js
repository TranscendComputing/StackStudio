/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true, laxcomma:true */
/*global define:true console:true */
define([
  'jquery',
  'underscore',
  'backbone',
  'icanhaz',
  'common',
  '/js/vendor/maple/js/maple.js',
  'views/resource/resourceTreeView',
  'views/resource/resourceAppView',
  'text!templates/vcloud/vcloudTreeViewTemplate.html'
], function ( $, _, Backbone, ich, Common, maple, ResourceTreeView, ResourceAppView, vcloudTreeViewTemplate ) {
	'use strict';

  var vcloudTree = ResourceTreeView.extend({

    template: _.template(vcloudTreeViewTemplate),

    render : function () {
      this.$el.html(this.template);
      $("#resource_app").html(this.$el);
      this.buildTree();
    },

    buildTree : function () {
      var treeView = this;

      $('#vcloud_tree').maple({
        tree : {
          branches : [
            {
              name: 'vDCs',
              type: 'folder',
              cssClass : 'vdc-item',
              url : Common.apiUrl + '/stackstudio/v1/cloud_management/vcloud/compute/data_centers',
              data : {
                cred_id : treeView.credentialId
              },
              preload : true,
              //formats tree data before displaying it
              onLoaded: treeView.onVdcsLoaded.bind(treeView)
            },
            {
              name : 'Networks',
              type: 'folder',
              url : Common.apiUrl + '/stackstudio/v1/cloud_management/vcloud/networks',
              data : {
                cred_id : treeView.credentialId
              },
              preload: true,
              onLoaded: treeView.onNetworksLoaded.bind(treeView)
            },
            {
              name: 'Catalogs',
              type: 'folder',
              url : Common.apiUrl + '/stackstudio/v1/cloud_management/vcloud/catalogs',
              data : {
                cred_id : treeView.credentialId
              },
              preload : true,
              onLoaded: treeView.onCatalogsLoaded.bind(treeView)
            }
          ]
        }
      });
    },

    onVdcsLoaded : function ( vdcs ) {
      var treeView = this;

      return vdcs.map(function ( vdc ) {
        return {
          name : vdc.name,
          cssClass : 'vdc-item',
          
          attributes : {
            "object-type" : "vdc"
          },

          branches : [
            {
              name : 'vApps',
              type: 'folder',
              url : Common.apiUrl + '/stackstudio/v1/cloud_management/vcloud/compute/vapps?vdc=' + encodeURIComponent(vdc.name),
              data : {
                cred_id : treeView.credentialId
              },
              preload : true,
              onLoaded : treeView.onVappsLoaded.bind(treeView)
            }
          ],
          onClicked : function ( $vdc ) {
            treeView.selectedVdc = vdc;
            var path = '/js/vcloud/views/compute/vcloudDataCentersAppView.js';
            treeView.loadChildView(path, { model : vdc, parentView : treeView });

            $('.maple-selected').removeClass('maple-selected');
            $vdc.children('span').addClass('maple-selected');
          }
        };
      });
    },

    onVappsLoaded : function ( vapps, $parent ) {

      var treeView = this;
      return vapps.map(function ( vapp ) {
        return {
          name : vapp.name,
          cssClass : 'vapp-item',
          
          attributes : {
            "object-type" : "vapp"
          },

          branches : [
            {
              name : 'VMs',
              cssClass : 'vms-folder',
              type : 'folder',
              url: Common.apiUrl + '/stackstudio/v1/cloud_management/vcloud/compute/vms',
              data : {
                cred_id : treeView.credentialId,
                vdc : vapp.vdc,
                vapp : vapp.name
              },
              preload : true,
              onLoaded : treeView.onVmsLoaded.bind(treeView)
            }
          ],

          onClicked : function ( $vapp ) {
            treeView.selectedVapp = vapp;
            var view = '/js/vcloud/views/compute/vcloudVappsAppView.js';
            treeView.loadChildView(view , {
              model : vapp,
              parentView : treeView
            });

            $('.maple-selected').removeClass('maple-selected');
            $vapp.children('span').addClass('maple-selected');
          }
        };
      });
    },

    onVmsLoaded : function ( vms, $parent ) {
      var treeView = this;

      return vms.map(function ( vm ) {
        return {
          name: vm.name,

          cssClass : 'vm-item',

          attributes : { 
            "object-type" : "vm",
            "vapp" : vm.vapp,
            "vdc" : vm.vdc
          },

          onClicked: function ( $vm ) {
            var view = '/js/vcloud/views/compute/vcloudVmsAppView.js'
              , vapp = vm.vapp
              , vdc = vm.vdc;
              
            treeView.loadChildView(view, { model: vm, parentView : treeView, vdc : vdc, vapp : vapp });
          }
        };
      });
    },

    onNetworksLoaded : function ( networks, $parent ) {

      var treeView = this;

      return networks.map(function ( network ) {
        return {
          name : network.name,
          cssClass : 'network-item',
          attributes : {
            "object-type" : 'network'
          },
          onClicked : function ( $network ) {
            var view = "/js/vcloud/views/network/vcloudNetworkAppView.js";
            treeView.loadChildView(view, { model : network, parentView : treeView });

            $('.maple-selected').removeClass('maple-selected');
            $(this).find('span').addClass('maple-selected');
          }
        };
      });
    },

    onCatalogsLoaded : function ( catalogs, $parent ) {

      var treeView = this;

      return catalogs.map(function ( catalog ) {
        return {
          name: catalog.name,
          cssClass : 'catalog-item',
          attributes : {
            'object-type' : 'catalog'
          },
          onClicked: function ( $catalog ) {
            var view = '/js/vcloud/views/catalog/vcloudCatalogAppView.js';
            treeView.loadChildView(view, { model : catalog, parentView : treeView });

            $('.maple-selected').removeClass('maple-selected');
            $(this).find('span').addClass('maple-selected');
          }
        };
      });
    },

    loadChildView : function ( view, options ) {
      var treeView = this;
      require([view], function ( AppView ) {

        var appViewParams = {
          $container : $('#tree_subview'),
          cred_id : treeView.credentialId
        };

        if(typeof options !== 'undefined') {
           appViewParams = _.extend(appViewParams, options);
        }

        var appView = new AppView(appViewParams);
      });
    }
  });

  return vcloudTree;

});