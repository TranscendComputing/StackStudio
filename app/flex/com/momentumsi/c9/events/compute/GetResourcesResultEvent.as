package com.momentumsi.c9.events.compute
{
	import mx.rpc.events.ResultEvent;
	
	public class GetResourcesResultEvent extends ResultEvent
	{
		public static const RESULT:String = "getResourcesResult";
		
		public function GetResourcesResultEvent(result:Object=null)
		{
			super(RESULT, false, true, result);
		}
	}
}