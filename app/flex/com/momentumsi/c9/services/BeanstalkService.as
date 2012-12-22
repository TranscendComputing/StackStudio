package com.momentumsi.c9.services
{
	import com.maccherone.json.JSON;
	import com.momentumsi.c9.events.beanstalk.CheckDnsAvailabilityResultEvent;
	import com.momentumsi.c9.events.beanstalk.CreateEnvironmentFaultEvent;
	import com.momentumsi.c9.events.beanstalk.CreateEnvironmentResultEvent;
	import com.momentumsi.c9.events.beanstalk.DescribeBeanstalkEventsFaultEvent;
	import com.momentumsi.c9.events.beanstalk.DescribeBeanstalkEventsResultEvent;
	import com.momentumsi.c9.events.beanstalk.DescribeEnvironmentsFaultEvent;
	import com.momentumsi.c9.events.beanstalk.DescribeEnvironmentsResultEvent;
	import com.momentumsi.c9.models.resources.ElasticBeanstalkApplication;
	
	import flash.events.DataEvent;
	import flash.events.Event;
	import flash.events.IOErrorEvent;
	import flash.net.FileReference;
	import flash.net.URLRequest;
	import flash.net.URLRequestMethod;
	import flash.net.URLVariables;
	
	import mx.collections.ArrayCollection;
	import mx.core.FlexGlobals;
	import mx.rpc.events.FaultEvent;
	import mx.rpc.events.ResultEvent;

	[Event(name="applicationCreated", type="flash.events.Event")]
	[Event(name="createApplicationFault", type="mx.rpc.events.FaultEvent")]
	[Event(name="applicationResourcesSet", type="flash.events.Event")]
	[Event(name="describeBeanstalkEventsResult", type="com.momentumsi.c9.events.beanstalk.DescribeBeanstalkEventsResultEvent")]
	[Event(name="describeBeanstalkEventsFault", type="com.momentumsi.c9.events.beanstalk.DescribeBeanstalkEventsFaultEvent")]
	[Event(name="createEnvironmentResult", type="com.momentumsi.c9.events.beanstalk.CreateEnvironmentResultEvent")]
	[Event(name="createEnvironmentFault", type="com.momentumsi.c9.events.beanstalk.CreateEnvironmentFaultEvent")]
	[Event(name="describeEnvironmentsResult", type="com.momentumsi.c9.events.beanstalk.DescribeEnvironmentsResultEvent")]
	[Event(name="describeEnvironmentsFault", type="com.momentumsi.c9.events.beanstalk.DescribeEnvironmentsFaultEvent")]
	[Event(name="checkDnsAvailabilityResult", type="com.momentumsi.c9.events.beanstalk.CheckDnsAvailabilityResultEvent")]
	
	[Bindable]
	public class BeanstalkService extends CloudApiService
	{
		//Actions
		public static const DESCRIBE_EVENTS:String = "describe_beanstalk_events";
		public static const CREATE_ENVIRONMENT:String = "create_environment";
		public static const DESCRIBE_APPLICATIONS:String = "describe_applications";
		public static const DESCRIBE_ENVIRONMENTS:String = "describe_environments";
		public static const DELETE_ENVIRONMENT:String = "delete_environment";
		public static const CHECK_DNS_AVAILABILITY:String = "check_dns_availability";
		
		/*******************
		 * Beanstalk Event Types
		 * *****************/
		public static const APPLICATION_CREATED:String = "applicationCreated";
		public static const CREATE_APPLICATION_FAULT:String = "createApplicationFault";
		public static const RESOURCES_SET:String = "applicationResourcesSet";
		
		
		/********
		 * Beanstalk resources
		 * ******/		
		public var environments:ArrayCollection = new ArrayCollection();
		public var versions:ArrayCollection = new ArrayCollection();
		public var solutionStacks:ArrayCollection = new ArrayCollection();
		public var keyPairs:ArrayCollection = new ArrayCollection();
		public var buckets:ArrayCollection = new ArrayCollection();
		public var prices:ArrayCollection = new ArrayCollection();
		public var events:ArrayCollection = new ArrayCollection();
		
		public static const AWS_32_INSTANCE_TYPES:ArrayCollection = new ArrayCollection([ 
			{type: "t1.micro"},
			{type: "m1.small"},
			{type: "c1.medium"},
			{type: "m1.medium"}
		]);
		public static const AWS_64_INSTANCE_TYPES:ArrayCollection = new ArrayCollection([ 
			{type: "t1.micro"},
			{type: "m1.small"},
			{type: "m1.medium"},
			{type: "m1.large"},
			{type: "m1.xlarge"},
			{type: "m2.xlarge"},
			{type: "m2.2xlarge"},
			{type: "m2.4xlarge"},
			{type: "c1.medium"},
			{type: "c1.xlarge"},
			{type: "cc1.4xlarge"},
			{type: "cc2.8xlarge"},
			{type: "cg1.4xlarge"}
		]);
		public static const TOPSTACK_INSTANCE_TYPES:ArrayCollection = new ArrayCollection([
			{type: "m1.large"}
		]);
		
		//Beanstalk create request
		private var createRequest:Object;
		
		public function BeanstalkService(rootURL:String=null, destination:String=null)
		{
			super(rootURL, destination);
			serviceType = BEANSTALK_SERVICE;
		}
		
		/************************
		 * Beanstalk API Actions
		 * **********************/
		
		public function describeApplications():void
		{
			action = DESCRIBE_APPLICATIONS;
			contentType = CONTENT_TYPE_JSON;
			addEventListener(ResultEvent.RESULT, describeApplications_resultHandler);
			send();
		}
		
		public function getBeanstalkResources():void
		{
			action = "get_beanstalk_resources";
			contentType = CONTENT_TYPE_JSON;
			addEventListener(ResultEvent.RESULT, getBeanstalkResources_resultHandler);
			send();
		}
		
		public function listAvailableSolutionStacks():void
		{
			action = "list_available_solution_stacks";
			contentType = CONTENT_TYPE_JSON;
			addEventListener(ResultEvent.RESULT, listAvailableSolutionStacks_resultHandler);
			send();
		}
		
		public function uploadApplication(fileRef:FileReference, bucket:String):void
		{
			var topApp:C9 = C9(FlexGlobals.topLevelApplication);
			var userId:String = topApp.user.id;
			var urlString:String = serviceUrl + "/s3_upload/" + userId + "/" + cloudAccountId + "/S3/" + bucket + "/upload_file_to_bucket";
			var uploadURLReq:URLRequest = new URLRequest(urlString);
			fileRef.addEventListener(DataEvent.UPLOAD_COMPLETE_DATA, uploadComplete_resultHandler);
			fileRef.addEventListener(IOErrorEvent.IO_ERROR, uploadFailed_handler);
			fileRef.upload(uploadURLReq);
		}
		
		public function createApplication(applicationName:String, applicationProperties:Object, environmentName:String=null, environmentProperties:Object=null):void
		{
			setPost();
			action = "create_application";
			request = new Object();
			request["ApplicationName"] = applicationName;
			request["ApplicationProperties"] = applicationProperties;
			request["EnvironmentName"] = environmentName;
			
			if(environmentProperties != null)
			{
				request["EnvironmentProperties"] = environmentProperties;
			}

			addEventListener(ResultEvent.RESULT, createApplication_resultHandler);
			addEventListener(FaultEvent.FAULT, createApplication_faultHandler);
			send();
		}
		
		public function describeEvents(filters:Object=null):void
		{
			setPost();
			action = DESCRIBE_EVENTS;
			request = {filters: filters};
			addEventListener(ResultEvent.RESULT, describeEvents_resultHandler);
			addEventListener(FaultEvent.FAULT, describeEvents_faultHandler);
			send();
		}
		
		public function createEnvironment(name:String, options:Object):void
		{
			setPost();
			action = CREATE_ENVIRONMENT;
			request = {name: name, options: options};
			addEventListener(ResultEvent.RESULT, createEnvironment_resultHandler);
			addEventListener(FaultEvent.FAULT, createEnvironment_faultHandler);
			send();
		}
		
		public function describeEnvironments(filters:Object=null):void
		{
			setPost();
			action = DESCRIBE_ENVIRONMENTS;
			request = {filters: filters};
			addEventListener(ResultEvent.RESULT, describeEnvironments_resultHandler);
			addEventListener(FaultEvent.FAULT, describeEnvironments_faultHandler);
			send();
		}
		
		public function checkDnsAvailability(cname:String):void
		{
			action = CHECK_DNS_AVAILABILITY;
			request = {cname: cname};
			addEventListener(ResultEvent.RESULT, checkDnsAvailability_resultHandler);
			addEventListener(FaultEvent.FAULT, checkDnsAvailability_faultHandler);
			send();
		}
		
		/****************************
		 * Beanstalk Result Handlers
		 * *************************/
		
		private function describeApplications_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, describeApplications_resultHandler);
			
		}
		
		private function getBeanstalkResources_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, getBeanstalkResources_resultHandler);
			solutionStacks = new ArrayCollection(result.solutionStacks as Array);
			prices = new ArrayCollection(result.prices as Array);
			keyPairs = new ArrayCollection(result.key_pairs as Array);
			keyPairs.addItemAt({name: "None"}, 0);
			buckets = new ArrayCollection(result.buckets as Array);
			dispatchEvent(new Event(RESOURCES_SET));
		}
		
		
		private function listAvailableSolutionStacks_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, listAvailableSolutionStacks_resultHandler);
			solutionStacks = new ArrayCollection(result as Array);
		}
		
		private function createApplication_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, createApplication_resultHandler);
			dispatchEvent(new Event(APPLICATION_CREATED));
		}
		
		private function uploadComplete_resultHandler(event:DataEvent):void
		{
			dispatchEvent(new DataEvent(event.type));
		}
		
		private function describeEvents_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, describeEvents_resultHandler);
			dispatchEvent(new DescribeBeanstalkEventsResultEvent(result));
		}
		
		private function createEnvironment_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, createEnvironment_resultHandler);
			dispatchEvent(new CreateEnvironmentResultEvent(result));
		}
		
		private function describeEnvironments_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, describeEnvironments_resultHandler);
			dispatchEvent(new DescribeEnvironmentsResultEvent(result));
		}
		
		private function checkDnsAvailability_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, checkDnsAvailability_resultHandler);
			dispatchEvent(new CheckDnsAvailabilityResultEvent(result));
		}
		
		/****************************
		 * Beanstalk Fault Handlers
		 * *************************/
		
		private function createApplication_faultHandler(event:FaultEvent):void
		{
			removeEventListener(FaultEvent.FAULT, createApplication_faultHandler);
			dispatchEvent(new FaultEvent(CREATE_APPLICATION_FAULT, false, true, event.fault));
		}
		
		private function uploadFailed_handler(event:IOErrorEvent):void
		{
			dispatchEvent(new FaultEvent(CREATE_APPLICATION_FAULT, false, true));
		}
		
		private function describeEvents_faultHandler(event:FaultEvent):void
		{
			removeEventListener(FaultEvent.FAULT, describeEvents_faultHandler);
			dispatchEvent(new DescribeBeanstalkEventsFaultEvent(event.fault));
		}
		
		private function createEnvironment_faultHandler(event:FaultEvent):void
		{
			removeEventListener(FaultEvent.FAULT, createEnvironment_faultHandler);
			dispatchEvent(new CreateEnvironmentFaultEvent(event.fault));
		}
		
		private function describeEnvironments_faultHandler(event:FaultEvent):void
		{
			removeEventListener(FaultEvent.FAULT, describeEnvironments_faultHandler);
			dispatchEvent(new DescribeEnvironmentsFaultEvent(event.fault));
		}
		
		private function checkDnsAvailability_faultHandler(event:FaultEvent):void
		{
			removeEventListener(FaultEvent.FAULT, checkDnsAvailability_faultHandler);
		}
	}
}