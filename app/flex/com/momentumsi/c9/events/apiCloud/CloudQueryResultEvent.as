package com.momentumsi.c9.events.apiCloud
{
	import mx.rpc.events.ResultEvent;
	
	public class CloudQueryResultEvent extends ResultEvent
	{
		public static const RESULT:String = "cloudQueryResult";
		
		public function CloudQueryResultEvent(result:Object=null)
		{
			super(RESULT, false, true, result);
		}
	}
}