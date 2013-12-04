/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2013 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true alert:true*/

define([
  'jquery',
  'underscore',
  'backbone',
  'models/ansibleQueueItem',
  'common'],

  function ($,_,Backbone, AnsibleQueueItem, Common) {
    'use strict';

    var AnsibleQueueItems = Backbone.Collection.extend({
      model : AnsibleQueueItem,
      url: Common.apiUrl + "/stackstudio/v1/queue/items/",

      comparator : function (model) {
        return model.get("stack_name");
      },
      fetch: function(options){
        options.data = $.paam({account_id:sessionStorage.accound_id}); 
        Backbone.Collection.prototype.fetch.apply(this, arguments);
      },

      parse: function (response) {
        var result = [];
        for (var i=0; i<response.length;i++) {
          result.push( {name:response[i]});
        }
        return result;
      },
      toJSON: function() {
        var $this = this;
        var result = {};
        $this.each( function(value) {
          //var name = value.id;
          // [XXX] send the whole shebang over
          result[name].push(value);
        });
        return result;
      }
    });
    return AnsibleQueueItems;
  }
);
