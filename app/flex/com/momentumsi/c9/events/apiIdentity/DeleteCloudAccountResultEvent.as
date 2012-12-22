package com.momentumsi.c9.events.apiIdentity
{
	import mx.rpc.events.ResultEvent;
	
	public class DeleteCloudAccountResultEvent extends ResultEvent
	{
		public static const RESULT:String = "deleteCloudAccountResult";
		
		public function DeleteCloudAccountResultEvent(result:Object=null)
		{
			super(RESULT, false, true, result);
		}
	}
}