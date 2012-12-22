package com.momentumsi.c9.models
{
	import com.momentumsi.c9.services.CloudApiService;
	
	import flash.events.EventDispatcher;

	[Bindable]
	public class CloudServiceModel extends EventDispatcher
	{
		private var _type:String;
		public var path:String;
		public var host:String;
		public var port:String;
		public var protocol:String;
		public var id:String;
		public var enabled:Boolean;
		
		public function CloudServiceModel()
		{
		}
		
		public static function buildCloudService(service:Object):CloudServiceModel
		{
			var cs:CloudServiceModel = new CloudServiceModel();
			cs._type = service.service_type;
			cs.protocol = service.protocol;
			cs.path = service.path;
			cs.port = service.port;
			cs.host = service.host;
			cs.id = service.id;
			cs.enabled = Boolean(service.enabled);
			return cs;
		}
		
		public function toObject():Object
		{
			return {cloud_service:{
				service_type: _type,
				path: path,
				port: port,
				host: host,
				protocol: protocol,
				enabled: enabled.toString()}
			};
					
		}
		
		public function set type(value:String):void
		{
			switch(value)
			{
				case "Compute Service":
					_type = CloudApiService.EC2_SERVICE;
					break;
				case "Load Balancer":
					_type = CloudApiService.ELB_SERVICE;
					break;
				case "Identity":
					_type = CloudApiService.IAM_SERVICE;
					break;
				case "Elastic Beanstalk":
					_type = CloudApiService.BEANSTALK_SERVICE;
					break;
				case "Simple Storage":
					_type = CloudApiService.S3_SERVICE;
					break;
				case "Cache Service":
					_type = CloudApiService.CACHE_SERVICE;
					break;
				case "Relational Database":
					_type = CloudApiService.RDS_SERVICE;
					break;
				case "Monitoring":
					_type = CloudApiService.ACW_SERVICE;
					break;
				case "Queue Service":
					_type = CloudApiService.SQS_SERVICE;
					break;
				case "DNS Service":
					_type = CloudApiService.DNS_SERVICE;
			}
		}
		
		public function get type():String
		{
			var displayString:String = new String();
			switch(_type)
			{
				case CloudApiService.EC2_SERVICE:
					displayString = "Compute Service";
					break;
				case CloudApiService.ELB_SERVICE:
					displayString = "Load Balancer";
					break;
				case CloudApiService.IAM_SERVICE:
					displayString = "Identity";
					break;
				case CloudApiService.BEANSTALK_SERVICE:
					displayString = "Elastic Beanstalk";
					break;
				case CloudApiService.S3_SERVICE:
					displayString = "Simple Storage";
					break;
				case CloudApiService.CACHE_SERVICE:
					displayString = "Cache Service";
					break;
				case CloudApiService.RDS_SERVICE:
					displayString = "Relational Database";
					break;
				case CloudApiService.ACW_SERVICE:
					displayString = "Monitoring";
					break;
				case CloudApiService.SQS_SERVICE:
					displayString = "Queue Service";
					break;
				case CloudApiService.DNS_SERVICE:
					displayString = "DNS Service";
					break;
			}
			return displayString;
		}
		
		public function get actualType():String
		{
			return _type;
		}
	}
}