package com.momentumsi.c9.events.cache
{
	import mx.rpc.events.ResultEvent;
	
	public class RevokeCacheSecurityGroupIngressResultEvent extends ResultEvent
	{
		public static const RESULT:String = "revokeCacheSecurityGroupIngressResult";
		
		public function RevokeCacheSecurityGroupIngressResultEvent(result:Object=null)
		{
			super(RESULT, false, false, result);
		}
	}
}