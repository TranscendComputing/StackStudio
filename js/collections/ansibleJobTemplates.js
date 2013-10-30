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
  'models/ansibleJobTemplate',
  'common'],

  function ($,_,Backbone, AnsibleJobTemplate, Common) {
    'use strict';

    var JobTemplates = Backbone.Collection.extend({
      model : AnsibleJobTemplate,
      url: Common.apiUrl + "/stackstudio/v1/orchestration/ansible/job_templates",

      comparator : function (model) {
        return model.get("name");
      },

      // [XXX] Iz all BS, still needs to be implemented on CloudMux
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
          var name = value.id;
          result[name].push(name);
        });
        return result;
      }
    });
    return JobTemplates;
  }
);
