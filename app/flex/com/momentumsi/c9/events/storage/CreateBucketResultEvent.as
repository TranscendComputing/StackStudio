package com.momentumsi.c9.events.storage
{
	import mx.rpc.events.ResultEvent;
	
	public class CreateBucketResultEvent extends ResultEvent
	{
		public static const RESULT:String = "createBucketResult";
		
		public function CreateBucketResultEvent(result:Object=null)
		{
			super(RESULT, false, true, result);
		}
	}
}