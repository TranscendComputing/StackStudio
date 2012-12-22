package com.momentumsi.c9.events.compute
{
	import mx.rpc.events.ResultEvent;
	
	public class StartInstanceResultEvent extends ResultEvent
	{
		public static const RESULT:String = "startInstanceResult";
		
		public function StartInstanceResultEvent(result:Object=null)
		{
			super(RESULT, false, true, result);
		}
	}
}