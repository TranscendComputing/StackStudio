package com.momentumsi.c9.events.apiIdentity
{
	import mx.rpc.events.ResultEvent;
	
	public class CreateCloudAccountResultEvent extends ResultEvent
	{
		public static const RESULT:String = "createCloudAccountResult";
		
		public function CreateCloudAccountResultEvent(result:Object=null)
		{
			super(RESULT, false, true, result);
		}
	}
}