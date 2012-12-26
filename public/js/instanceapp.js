/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under MIT license <https://raw.github.com/TranscendComputing/StackStudio/master/LICENSE.md>
 */
require(['./common'], function (common) {
	require([
	         'views/instanceAppView'
	        ], function( InstancesView ) {

		// Initialize the application view
		new InstancesView();

	});
});
