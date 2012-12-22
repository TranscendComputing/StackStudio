package com.momentumsi.c9.services
{
	import com.momentumsi.c9.events.CloudResultEvent;
	import com.momentumsi.c9.events.apiCloud.CloudQueryFaultEvent;
	import com.momentumsi.c9.events.apiCloud.CloudQueryResultEvent;
	import com.momentumsi.c9.models.Cloud;
	import com.momentumsi.c9.models.CloudMapping;
	import com.momentumsi.c9.models.CloudServiceModel;
	import com.momentumsi.c9.serializers.JSONSerializationFilter;
	
	import flash.net.URLRequest;
	import flash.net.URLRequestMethod;
	
	import mx.collections.ArrayCollection;
	import mx.rpc.events.FaultEvent;
	import mx.rpc.events.ResultEvent;
	
	[Event(name="cloudQueryResult", type="com.momentumsi.c9.events.apiCloud.CloudQueryResultEvent")]
	[Event(name="cloudQueryFault", type="com.momentumsi.c9.events.apiCloud.CloudQueryFaultEvent")]
	[Event(name="serviceAdded", type="com.momentumsi.c9.events.CloudResultEvent")]
	[Event(name="serviceRemoved", type="com.momentumsi.c9.events.CloudResultEvent")]
	
	[Bindable]
	public class CloudService extends ApiService
	{
		public var cloudId:String;
		public var cloud:Cloud;
		public var cloudCollection:ArrayCollection = new ArrayCollection();
		
		private var cloudUrl:String;
		public function CloudService(rootURL:String=null, destination:String=null)
		{
			super(rootURL, destination);
			cloudUrl = url + "/stackstudio/v1/clouds";
		}
		
		// API Actions
		public function getClouds():void
		{
			var timeStampForNoCache:Date = new Date();
			method = URLRequestMethod.GET;
			contentType = CONTENT_TYPE_JSON;
			serializationFilter = new JSONSerializationFilter();
			addEventListener(ResultEvent.RESULT, getClouds_resultHandler);
			addEventListener(FaultEvent.FAULT, getClouds_faultHandler);
			url = cloudUrl + "?time=" + timeStampForNoCache.toString().replace(/\s/g);;
			send();
		}
		
		public function createNewMapping(mapping:CloudMapping):void
		{
			setPost();
			url = cloudUrl + "/" + cloudId + "/mappings";
			request = mapping.toObject();
			send();
		}
		
		public function deleteMapping(id:String):void
		{
			method = URLRequestMethod.POST;
			contentType = CONTENT_TYPE_FORM;
			url = cloudUrl + "/" + cloudId + "/mappings/" + id + "?_method=DELETE";
			send();
		}
		
		public function removeService(serviceId:String):void
		{
			setPost();
			url = cloudUrl + "/" + cloud.id + "/services/" + serviceId + "?_method=DELETE";
			addEventListener(ResultEvent.RESULT, removeService_resultHandler);
			send();
		}
		
		public function addService(service:CloudServiceModel):void
		{
			setPost();
			//contentType = CONTENT_TYPE_FORM;
			url = cloudUrl + "/" + cloud.id + "/services";
			request = service.toObject();
			addEventListener(ResultEvent.RESULT, addService_resultHandler);
			send();
		}
		
		/*******************
		 *  Result Handlers
		 * ****************/
		
		private function getClouds_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, getClouds_resultHandler);
			
			cloudCollection.removeAll();
			var clouds:ArrayCollection = new ArrayCollection(result.clouds as Array);
			for each(var item:Object in clouds)
			{
				cloudCollection.addItem(Cloud.buildCloud(item.cloud));
			}
			
			dispatchEvent(new CloudQueryResultEvent(result));
		}
		
		private function addService_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, addService_resultHandler);
			if(cloud != null)
			{
				cloud.update(result.cloud);
			}
			dispatchEvent(new CloudResultEvent(CloudResultEvent.SERVICE_ADDED));
		}
		
		private function removeService_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, removeService_resultHandler);
			if(cloud != null)
			{
				cloud.update(result.cloud);
			}
			dispatchEvent(new CloudResultEvent(CloudResultEvent.SERVICE_REMOVED));
		}
		
		/*******************
		 *  Fault Handlers
		 * ****************/
		
		private function getClouds_faultHandler(event:FaultEvent):void
		{
			removeEventListener(FaultEvent.FAULT, getClouds_faultHandler);
			dispatchEvent(new CloudQueryFaultEvent(event.fault));
		}
	}
}