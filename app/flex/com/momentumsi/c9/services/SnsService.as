package com.momentumsi.c9.services
{
	import mx.collections.ArrayCollection;
	import mx.rpc.events.ResultEvent;

	[Bindable]
	public class SnsService extends CloudApiService
	{
		public var topics:ArrayCollection;
		public function SnsService(rootURL:String=null, destination:String=null)
		{
			super(rootURL, destination);
			serviceType = SNS_SERVICE;
		}
		
		/****************
		 * 	SNS API Actions
		 * **************/
		
		public function listTopics():void
		{
			action = "list_topics";
			contentType = CONTENT_TYPE_JSON;
			addEventListener(ResultEvent.RESULT, listTopics_resultHandler);
			send();
		}
		
		/**********************
		 * SNS Result Handlers
		 * ********************/
		
		private function listTopics_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, listTopics_resultHandler);
			topics = new ArrayCollection(result as Array);
		}
	}
}