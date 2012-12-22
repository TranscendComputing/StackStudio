package com.momentumsi.c9.events.compute
{
	import mx.rpc.events.ResultEvent;
	
	public class GetConsoleOutputResultEvent extends ResultEvent
	{
		public static const RESULT:String = "getConsoleOutputResult";
		
		public function GetConsoleOutputResultEvent(result:Object=null)
		{
			super(RESULT, false, true, result);
		}
	}
}