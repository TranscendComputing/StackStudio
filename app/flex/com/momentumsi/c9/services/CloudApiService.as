package com.momentumsi.c9.services
{
	import mx.collections.ArrayCollection;
	import mx.controls.Alert;
	import mx.core.FlexGlobals;
	import mx.rpc.AsyncToken;
	import mx.rpc.events.FaultEvent;
	import mx.rpc.events.ResultEvent;
	
	import spark.formatters.DateTimeFormatter;

	public class CloudApiService extends ApiService
	{
		public var serviceType:String;
		public var action:String;
		public var cloudAccountId:String;
		public var region:String;
		private var userId:String;
		
		public static const AVAILABLE_SERVICES:ArrayCollection = new ArrayCollection([
			"Compute Service",
			"Load Balancer",
			"Identity",
			"Elastic Beanstalk",
			"Simple Storage",
			"Cache Service",
			"Relational Database",
			"Monitoring",
			"Queue Service",
			"DNS Service"
		]);
		
		public static const EC2_SERVICE:String = "EC2";
		public static const EBS_SERVICE:String = "EBS";
		public static const BEANSTALK_SERVICE:String = "AWSEB";
		public static const ACW_SERVICE:String = "ACW";
		public static const AS_SERVICE:String = "AS";
		public static const ELB_SERVICE:String = "ELB";
		public static const SIMPLE_DB_SERVICE:String = "SDB";
		public static const SNS_SERVICE:String = "SNS";
		public static const SQS_SERVICE:String = "SQS";
		public static const S3_SERVICE:String = "S3";
		public static const RDS_SERVICE:String = "RDS";
		public static const IAM_SERVICE:String = "IAM";
		public static const CACHE_SERVICE:String = "ELC";
		public static const CF_SERVICE:String = "AWSCFN";
		public static const CDN_SERVICE:String = "CDN";
		public static const DNS_SERVICE:String = "DNS";
		public static const SECURITY_GROUP:String = "securityGroup";
		
		public function CloudApiService(rootURL:String=null, destination:String=null)
		{
			super(rootURL, destination);	
			addEventListener(FaultEvent.FAULT, faultHandler)
		}
		
		private function faultHandler(event:FaultEvent):void
		{
			if(fault != null)
			{
				var errorMessage:String = fault.message;
				if(errorMessage != "")
				{
					Alert.show(fault.message, fault.title);
				}else if(event.statusCode == 500)
				{
					Alert.show("Internal service error.  Try re-saving cloud account.", "InternalError");
				}
			}
		}
		public function validateTemplate(templateLoadFrom:String, source:String):void
		{
			this.url = serviceUrl + "/validating/" + cloudAccountId + "/" + CF_SERVICE + "/" + templateLoadFrom + "/validate_template";
			setPost();
			super.send({data: source});
		    showBusyCursor = true;
		}
		
		public function getScriptParameters(bucketName:String, bucketKey:String):void
		{
			this.url = serviceUrl + "/scripts/" + cloudAccountId + "/get_parameters";
			request = {
				bucket: bucketName,
				key: bucketKey
			}
			super.send();
		}
		
		public function setUrl():void
		{
			var topApp:C9 = C9(FlexGlobals.topLevelApplication);
			userId = topApp.user.id;
			if(serviceUrl == null)
			{
				serviceUrl = topApp.GetConfiguration("serviceUrl");
			}
			this.url = serviceUrl + "/provisioning/" + userId + "/" + cloudAccountId + "/" + serviceType + "/" + action;			
		}
		
		override public function send(parameters:Object=null):AsyncToken
		{
			setUrl();
			if(request == null)
				request = {region: region};
			else
				request["region"] = region;
			//merge parameters into request; set parameters = null
			//NOTE: if property exists in parameters and request, parameter value will overwrite request value
			if(parameters != null)
			{
				for(var p:Object in parameters)
				{
					request[p] = parameters[p];
				}
				parameters = null;
			}
			
			return super.send(parameters);
		}
	}
}