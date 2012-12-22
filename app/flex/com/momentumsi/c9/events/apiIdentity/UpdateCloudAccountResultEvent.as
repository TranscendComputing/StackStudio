package com.momentumsi.c9.events.apiIdentity
{
	import mx.rpc.events.ResultEvent;
	
	public class UpdateCloudAccountResultEvent extends ResultEvent
	{
		public static const RESULT:String = "updateCloudAccountResult";
		
		public function UpdateCloudAccountResultEvent(result:Object=null)
		{
			super(RESULT, false, true, result);
		}
	}
}