require(['./common'], function (common) {
	require([
	         'views/instanceAppView'
	        ], function( InstancesView ) {

		// Initialize the application view
		new InstancesView();

	});
});
