/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */

// [XXX] Still just a stub for now

define([
  'jquery',
  'backbone'],
  function($,Backbone) {
    'use strict';
    var AnsibleJobTemplate = Backbone.Model.extend({
      idAttribute: 'name',
      defaults: {
        name: '',
        description: '',
        // [XXX] We defining these just for future reference
        id: '',
        related: [],
        summary_fields: {},
        created: '',
        modified: '',
        job_type: '',
        inventory: '',
        project: '',
        playbook: '',
        credential: '',
        forks: '',
        limit: '',
        verbosity: '',
        extra_vars: '',
        job_tags: '',
        host_config_key: ''
      }
    });
    return AnsibleJobTemplate;
  }
);
