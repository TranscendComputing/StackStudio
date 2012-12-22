package com.momentumsi.c9.events.compute
{
	import mx.rpc.events.ResultEvent;
	
	public class RevokePortRangeResultEvent extends ResultEvent
	{
		public static const RESULT:String = "revokePortRangeResult";
		
		public function RevokePortRangeResultEvent(result:Object=null)
		{
			super(RESULT, false, false, result);
		}
	}
}