package com.momentumsi.c9.events.compute
{
	import mx.rpc.events.ResultEvent;
	
	public class AuthorizePortRangeResultEvent extends ResultEvent
	{
		public static const RESULT:String = "authorizePortRangeResult";
		
		public function AuthorizePortRangeResultEvent(result:Object=null)
		{
			super(RESULT, false, false, result);
		}
	}
}