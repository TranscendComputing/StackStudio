package com.momentumsi.c9.events.compute
{
	import mx.rpc.events.ResultEvent;
	
	public class RebootInstanceResultEvent extends ResultEvent
	{
		public static const RESULT:String = "rebootInstanceResult";
		
		public function RebootInstanceResultEvent(result:Object=null)
		{
			super(RESULT, false, true, result);
		}
	}
}