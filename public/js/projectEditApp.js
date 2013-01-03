/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
require(['./common'], function (common) {
	require([
	         'views/projectEditView'
	        ], function( ProjectEditView ) {

		// Initialize the application view
		new ProjectEditView();

	});
});