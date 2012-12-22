package com.momentumsi.c9.events.cloudFromation
{
	import mx.rpc.events.ResultEvent;
	
	public class CreateCFStackResultEvent extends ResultEvent
	{
		public static const RESULT:String = "createCFStackResult";
		
		public function CreateCFStackResultEvent(result:Object=null)
		{
			super(RESULT, false, true, result);
		}
	}
}