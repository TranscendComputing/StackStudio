/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
define([
        'jquery',
        'backbone',
        'models/stack',
        'common'
], function( $, Backbone, Stack, Common ) {
	'use strict';

	var StackList = Backbone.Collection.extend({

		model: Stack,

		url: function(){return Common.apiUrl + '/stackstudio/v1/stacks/account/' + sessionStorage.account_id;},
		
	});

	return StackList;

});