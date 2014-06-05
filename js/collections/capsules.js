/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2014 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true alert:true*/
define([
        'jquery',
        'backbone',
        'models/capsule',
        'common'
], function( $, Backbone, Capsule, Common) {
	'use strict';

	var CapsuleList = Backbone.Collection.extend({

		model: Capsule,

    url: function(options){
      // return Common.apiUrl + '/stackstudio/v1/capsules/org/' + sessionStorage.org_id;
      return 'test/fixtures/meshes/capsules_list.json';
    }
	
	});

	return CapsuleList;

});
