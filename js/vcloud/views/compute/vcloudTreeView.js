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
  'text!templates/vcloud/vcloudTreeViewTemplate.html',
  '/js/vcloud/collections/compute/vcloudDataCenters.js',
  '/js/vcloud/collections/network/vcloudNetworks.js',
  '/js/vcloud/collections/catalog/vcloudCatalogs.js',
  '/js/vcloud/collections/compute/vcloudVapps.js',
  '/js/vcloud/collections/compute/vcloudVms.js'
], function ( $, _, Backbone, ich, Common, maple, ResourceTreeView, ResourceAppView, vcloudTreeViewTemplate, DataCenters, Networks, Catalogs, Vapps, Vms ) {
	'use strict';

  var vcloudTree = ResourceTreeView.extend({

    template: _.template(vcloudTreeViewTemplate),

    Networks : Networks,

    Catalogs : Catalogs,

    Vapps : Vapps,

    Vms : Vms,

    vdc : undefined,

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
              name: 'vApps',
              type: 'folder',
              cssClass : 'vapp-item',
              preload : true,
              getData : treeView.getFetchFunction(treeView.Vapps, treeView.formatVapp, { vdc : treeView.vdc })
            },
            {
              name : 'Networks',
              type: 'folder',
              preload: true,
              getData : treeView.getFetchFunction(treeView.Networks, treeView.formatNetwork)
            },
            {
              name: 'Catalogs',
              type: 'folder',
              preload : true,
              getData : treeView.getFetchFunction(treeView.Catalogs, treeView.formatCatalog)
            }
          ]
        }
      });
    },

    getFetchFunction : function ( Collection, format, data ) {
      var treeView = this;
      
      return function ( cb ) {
        var collection = new Collection({
          cred_id : treeView.credentialId
        });

        var options = {
          success : function ( models ) {
            models = _.pluck(models.models, "attributes").map(format.bind(treeView));
            cb(models);
          }
        };

        if(data) {
          options.data = data;
        }

        collection.fetch(options);
      };
    },

    formatNetwork : function ( network ) {
      var treeView = this;
      
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
    },

    formatCatalog : function ( catalog ) {
      var treeView = this;

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
    },

    formatVapp : function ( vapp ) {
      var treeView = this;

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
            getData : function ( cb ) {
              var VMs = new treeView.Vms({
                cred_id : treeView.credentialId
              });

              VMs.fetch({
                data : {
                  vdc : vapp.vdc,
                  vapp : vapp.name
                },
                success : function ( vms ) {
                  vms = vms.models.map(treeView.formatVm.bind(treeView));
                  cb(vms);
                }
              });
            },
            preload : true
          }
        ],

        onClicked : function ( $vapp ) {
          treeView.selectedVapp = vapp;
          var view = '/js/vcloud/views/compute/vcloudVappAppView.js';
          treeView.loadChildView(view , {
            model : vapp,
            parentView : treeView
          });

          $('.maple-selected').removeClass('maple-selected');
          $vapp.children('span').addClass('maple-selected');
        }
      };
    },

    formatVm : function ( vm ) {
      var treeView = this;
      var atts = vm.attributes;

      return {
        name: atts.name,

        cssClass : 'vm-item',

        attributes : { 
          "object-type" : "vm",
          "vapp" : atts.vapp,
          "vdc" : atts.vdc
        },

        onClicked: function ( $vm ) {
          var view = '/js/vcloud/views/compute/vcloudVmAppView.js'
            , vapp = atts.vapp
            , vdc = atts.vdc;
            
          treeView.loadChildView(view, { model: vm, parentView : treeView, vdc : vdc, vapp : vapp });
        }
      };
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