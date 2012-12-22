package com.momentumsi.c9.services
{
	import com.momentumsi.c9.utils.Helpers;
	
	import mx.core.FlexGlobals;
	import mx.rpc.events.FaultEvent;
	import mx.rpc.events.ResultEvent;
	import mx.rpc.http.mxml.HTTPService;
	
	[Bindable]
	public class MonitoringService extends HTTPService
	{
		public var defaultMonitors:XMLList;
		
		public var serviceType:String;
		public var action:String;
		public var cloudAccountId:String;
		public var region:String;
		
		private var apiUrl:String;
		
		public static const EC2_DEFAULT:String = "ec2";
		public static const ELB_DEFAULT:String = "lb";
		public static const RDS_DEFAULT:String = "rds";
		public static const SQS_DEFAULT:String = "sqs";
		public static const EBS_DEFAULT:String = "ebs";
		public static const ELC_DEFAULT:String = "elc";
		public static const ELC_NODE_DEFAULT:String = "elc_node";
		public static const ELC_NODE_STATS:String = "elc_node_stats";
		public static const SNS_DEFAULT:String = "sns";
		public static const AS_DEFAULT:String = "as";
		
		public function MonitoringService(rootURL:String=null, destination:String=null)
		{
			super(rootURL, destination);
			apiUrl = FlexGlobals.topLevelApplication.GetConfiguration("serviceUrl");
			addEventListener(FaultEvent.FAULT, defaultFaultHandler);
		}
		
		public function getDefaultMonitors(serviceType:String):void
		{
			this.serviceType = serviceType;
			url = "data/" + serviceType + "_monitor_defaults.xml";
			resultFormat = RESULT_FORMAT_E4X;
			method = "GET";
			addEventListener(ResultEvent.RESULT, getDefaultMonitors_resultHandler);
			if(request == null)
			{
				request = {region: region};
			}else
			{
				request["region"] = region;
			}
			send();
		}
		
		public function getStatistics(instanceId:String, startTime:int, period:int, clusterId:String=null):void
		{
			url = apiUrl + "/monitoring/" + cloudAccountId + "/" + instanceId + "/" + startTime + "/" + period + "/get_monitor_stats";
			resultFormat = RESULT_FORMAT_E4X;
			method = "GET";
			if(request == null)
			{
				request = {region: region};
			}else
			{
				request["region"] = region;
			}
			send();
		}
		
		
		
		/***********
		 * Result Handlers
		 * */
		
		private function getDefaultMonitors_resultHandler(event:ResultEvent):void
		{
			defaultMonitors = Helpers.xmlChildrenFromEvent(event);
		}
		
		/*************
		 * Fault Handlers
		 * ***********/
		
		private function defaultFaultHandler(event:FaultEvent):void
		{
			var fault:Object = event.fault;
		}
	}
}