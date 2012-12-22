package com.momentumsi.c9.events.cloudFromation
{
	import mx.rpc.events.ResultEvent;
	
	public class UpdateCFStackResultEvent extends ResultEvent
	{
		public static const RESULT:String = "updateCFStackResult";
		
		public function UpdateCFStackResultEvent(result:Object=null)
		{
			super(RESULT, false, true, result);
		}
	}
}