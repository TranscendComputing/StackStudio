package com.momentumsi.c9.components.elb
{
	import com.momentumsi.c9.utils.Helpers;
	
	import flash.events.EventDispatcher;
	
	import mx.collections.ArrayCollection;
	import mx.collections.XMLListCollection;
	import mx.containers.TitleWindow;
	import mx.controls.Alert;
	import mx.controls.DataGrid;
	import mx.core.FlexGlobals;
	import mx.core.UIComponent;
	import mx.events.CloseEvent;
	import mx.managers.PopUpManager;
	import mx.rpc.events.ResultEvent;
	import mx.rpc.http.HTTPService;
	import mx.utils.XMLUtil;
	
	import spark.components.Image;
	
	

	
	public final class LoadBalancerConfigurations
	{
		[Bindable]
		public var accountId:int;
		[Bindable]
		private var host:String;
		private var app:Object = FlexGlobals.topLevelApplication;
		[Bindable]
		public var loadBalancersContainer:ArrayCollection = new ArrayCollection();
		[Bindable]
		public var loadBalancers:XMLList;
		[Bindable]
		public var selectedBalancer:Object = new Object;
		public var loadBalancerId:int = 0;
		
		public function LoadBalancerConfigurations()
		{
			
		}
		
		public static function configureHealthCheck(id:int, params:Object):void
		{
			var host:String;
			var app:Object = FlexGlobals.topLevelApplication;
			host = app.GetConfiguration( "serviceUrl" ) ;
			var service:HTTPService = new HTTPService();
			service.url = host + "/load_balancers/configure_health_check";
			service.method = "POST";
			service.resultFormat="e4x";
			service.addEventListener(ResultEvent.RESULT, handleHealthCheck);
			service.send({id: id, interval: params.health_check_interval, timeout: params.resp_timeout, 
				port: params.ping_port, path: params.ping_path, protocol: params.ping_protocol, healthy_threshold: params.healthy_threshold, unhealthy_threshold: params.unhealthy_threshold});
		}
		
		public static function handleHealthCheck(event:ResultEvent):void
		{
			var healthCheck:XMLList = Helpers.xmlChildrenFromEvent(event);
		}
		
		public static function registerInstances(id:int, instances:ArrayCollection):void
		{
			var host:String;
			var app:Object = FlexGlobals.topLevelApplication;
			host = app.GetConfiguration( "serviceUrl" ) ;
			var instance_ids:Array = new Array;
			for(var i:int = 0; i < instances.length; i++)
			{
				instance_ids.push(instances.getItemAt(i).child('aws-instance-id'));
			}
			var instanceIdsString:String = instance_ids.join(', ');
			var service:HTTPService = new HTTPService();
			service.url = host + "/load_balancers/register_instances";
			service.method = "POST";
			service.resultFormat="e4x";
			//service.addEventListener(ResultEvent.RESULT, loadBalancerCompleted);
			service.send({id: id, instance_ids: instanceIdsString});
		}
	}
}