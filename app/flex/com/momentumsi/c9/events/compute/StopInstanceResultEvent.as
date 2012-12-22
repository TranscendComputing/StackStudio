package com.momentumsi.c9.events.compute
{
	import mx.rpc.events.ResultEvent;
	
	public class StopInstanceResultEvent extends ResultEvent
	{
		public static const RESULT:String = "stopInstanceResult";
		
		public function StopInstanceResultEvent(result:Object=null)
		{
			super(RESULT, false, true, result);
		}
	}
}