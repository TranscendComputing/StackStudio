package com.momentumsi.c9.events.cloudFromation
{
	import mx.rpc.events.ResultEvent;
	
	public class DeleteCFStackResultEvent extends ResultEvent
	{
		public static const RESULT:String = "deleteCFStackResult";
		
		public function DeleteCFStackResultEvent(result:Object=null)
		{
			super(RESULT, false, true, result);
		}
	}
}