package com.momentumsi.c9.components
{
	import com.momentumsi.c9.models.CloudAccount;
	import com.momentumsi.c9.services.CloudApiService;
	
	import mx.collections.ArrayCollection;
	import mx.rpc.events.FaultEvent;
	import mx.rpc.events.ResultEvent;
	
	import spark.components.NavigatorContent;
	
	[Event(name="resourceComplete", type="mx.rpc.events.ResultEvent")]
	[Event(name="resourceFailed", type="mx.rpc.events.FaultEvent")]
	
	[Bindable]
	public class ObjectManagementResourceContent extends NavigatorContent
	{
		public var action:String;
		public var cloudAccount:CloudAccount;
		public var region:String;
		public var serviceType:String;
		public var resourceCollection:ArrayCollection;
		
		private var service:CloudApiService = new CloudApiService();
		
		public function ObjectManagementResourceContent()
		{
			super();
		}
		
		public function getResources(refresh:Boolean=false):void
		{
			if(resourceCollection == null || refresh == true)
			{
				service.action = action;
				service.cloudAccountId = cloudAccount.id;
				service.region = region;
				service.serviceType = serviceType;
				service.addEventListener(ResultEvent.RESULT, getResources_resultHandler);
				service.addEventListener(FaultEvent.FAULT, getResources_faultHandler);
				service.send();
			}
		}
		
		private function getResources_resultHandler(event:ResultEvent):void
		{
			resourceCollection = new ArrayCollection(service.result.instances as Array);
			dispatchEvent(new ResultEvent("resourceComplete", false, true, event.result));
		}
		
		private function getResources_faultHandler(event:FaultEvent):void
		{
			trace(event.fault);
			dispatchEvent(new FaultEvent("resourceFailed", false, true, event.fault));
		}
	}
}