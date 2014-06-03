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
        'models/grid',
        'common'
], function( $, Backbone, Grid, Common) {
	'use strict';

	var GridList = Backbone.Collection.extend({

		model: Grid,

    url: function(options){
      // return Common.apiUrl + '/stackstudio/v1/grids/org/' + sessionStorage.org_id;
      return 'test/fixtures/meshes/grids_list.json';
    }
	
	});

	return GridList;

});
