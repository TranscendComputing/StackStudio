package com.momentumsi.c9.events.cache
{
	import mx.rpc.events.ResultEvent;
	
	public class CreateCacheSecurityGroupResultEvent extends ResultEvent
	{
		public static const RESULT:String = "createCacheSecurityGroupResult";
		public function CreateCacheSecurityGroupResultEvent(result:Object=null)
		{
			super(RESULT, false, false, result);
		}
	}
}