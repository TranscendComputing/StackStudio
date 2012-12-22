package com.momentumsi.c9.events.cache
{
	import mx.rpc.events.ResultEvent;
	
	public class DeleteCacheSecurityGroupResultEvent extends ResultEvent
	{
		public static const RESULT:String = "deleteCacheSecurityGroupResult";
		
		public function DeleteCacheSecurityGroupResultEvent(result:Object=null)
		{
			super(type, false, false, result);
		}
	}
}