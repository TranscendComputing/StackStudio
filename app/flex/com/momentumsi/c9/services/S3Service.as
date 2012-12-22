package com.momentumsi.c9.services
{
	import com.momentumsi.c9.events.storage.CreateBucketFaultEvent;
	import com.momentumsi.c9.events.storage.CreateBucketResultEvent;
	import com.momentumsi.c9.events.storage.DescribeBucketsFaultEvent;
	import com.momentumsi.c9.events.storage.DescribeBucketsResultEvent;
	import com.momentumsi.c9.utils.Helpers;
	
	import mx.collections.ArrayCollection;
	import mx.controls.Alert;
	import mx.rpc.events.FaultEvent;
	import mx.rpc.events.ResultEvent;
	import mx.rpc.http.mxml.HTTPService;

	[Event(name="describeBucketsResult", type="com.momentumsi.c9.events.storage.DescribeBucketsResultEvent")]
	[Event(name="describeBucketsFault", type="com.momentumsi.c9.events.storage.DescribeBucketsFaultEvent")]
	[Event(name="createBucketResult", type="com.momentumsi.c9.events.storage.CreateBucketResultEvent")]
	[Event(name="createBucketFault", type="com.momentumsi.c9.events.storage.CreateBucketFaultEvent")]
	
	[Bindable]
	public class S3Service extends CloudApiService
	{
		//Actions
		public static const DESCRIBE_STORAGE:String = "describe_storage";
		public static const CREATE_BUCKET:String = "create_storage_container";
		
		public var bucketContents:ArrayCollection = new ArrayCollection();
		public var buckets:ArrayCollection = new ArrayCollection();
		
		public function S3Service(rootURL:String=null, destination:String=null)
		{
			super(rootURL, destination);
			serviceType = S3_SERVICE;
		}
		
		public function listBucket(bucketName:String):void
		{
			action = "list_bucket";
			request = {physical_id: bucketName};
			addEventListener(ResultEvent.RESULT, listBucket_resultHandler);
			send();
		}
		
		public function describeBuckets():void
		{
			action = DESCRIBE_STORAGE;
			addEventListener(ResultEvent.RESULT, describeBuckets_resultHandler);
			addEventListener(FaultEvent.FAULT, describeBuckets_faultHandler);
			send();
		}
		
		public function createBucket(name:String):void
		{
			setPost();
			action = CREATE_BUCKET;
			request = {name: name};
			addEventListener(ResultEvent.RESULT, createBucket_resultHandler);
			addEventListener(FaultEvent.FAULT, createBucket_faultHandler);
			send();
		}
		
		
		/********************************
		 * Result Handlers
		 * *****************************/
		
		private function listBucket_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, listBucket_resultHandler);
			bucketContents = new ArrayCollection(result as Array);
		}

		private function listAllBuckets_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, listAllBuckets_resultHandler);
			buckets = new ArrayCollection(result as Array);
		}
		
		private function describeBuckets_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, describeBuckets_resultHandler);
			dispatchEvent(new DescribeBucketsResultEvent(result));
		}
		
		private function createBucket_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, createBucket_resultHandler);
			dispatchEvent(new CreateBucketResultEvent(result));
		}
		
		/********************************
		 * Fault Handlers
		 * *****************************/
		
		private function externalBucketList_faultHandler(event:FaultEvent):void
		{
			if(event.statusCode == 403)
			{
				Alert.show("Bucket must be accessible to the public in order to user scripts.", "Access Denied");
			}
		}
		
		private function describeBuckets_faultHandler(event:FaultEvent):void
		{
			removeEventListener(FaultEvent.FAULT, describeBuckets_faultHandler);
			dispatchEvent(new DescribeBucketsFaultEvent(event.fault));
		}
		
		private function createBucket_faultHandler(event:FaultEvent):void
		{
			removeEventListener(FaultEvent.FAULT, createBucket_faultHandler);
			dispatchEvent(new CreateBucketFaultEvent(event.fault));
		}
	}
}