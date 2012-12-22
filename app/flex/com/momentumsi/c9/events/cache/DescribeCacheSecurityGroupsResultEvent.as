package com.momentumsi.c9.events.cache
{
	import mx.rpc.events.ResultEvent;
	
	public class DescribeCacheSecurityGroupsResultEvent extends ResultEvent
	{
		public static const RESULT:String = "describeCacheSecurityGroupsResult";
		
		public function DescribeCacheSecurityGroupsResultEvent(result:Object=null)
		{
			super(RESULT, false, false, result);
		}
	}
}