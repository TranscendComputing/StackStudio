/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
define([
  'jquery',
  'models/resource/resourceModel',
  'common'
], function( $, ResourceModel , Common) {
  'use strict';

  // Cloud Credential Model
  // ----------

  /**
   *
   * @name AnsibleQueueItem
   * @constructor
   * @category Account
   * @param {Object} initialization object.
   * @returns {Object} Returns a CloudCredential instance.
   */
  var AnsibleQueueItem = ResourceModel.extend({

   idAttribute: "_id",
   /** Default attributes for cloud credential */
   defaults: {
     id: "",
     host_name: '',
     jobs: "",
     errors: '',
     completed: false
   },

   create : function(cred_id, stack_name, host_name, jobs){
    var url = Common.apiUrl + "/stackstudio/v1/queue/item/"+ "?account_id="+ sessionStorage.account_id;
    this.sendAjaxAction(url, "POST", {"credential_id" : cred_id, "stack_name": stack_name, "host_name":host_name, "jobs": jobs});
   },

   save : function(cred_id, stack_name, host_name, jobs){
    var url = Common.apiUrl + "/stackstudio/v1/queue/item/"+ "?account_id="+ sessionStorage.account_id;
    this.sendAjaxAction(url, "POST", {"credential_id" : cred_id, "stack_name": stack_name, "host_name":host_name, "jobs": jobs});
   }

  });

  return AnsibleQueueItem;
});
