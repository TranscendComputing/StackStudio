package com.momentumsi.c9.events.compute
{
	import mx.rpc.events.ResultEvent;
	
	public class GetPuppetClassesResultEvent extends ResultEvent
	{
		public static const RESULT:String = "getPuppetClassesResult";
		
		public function GetPuppetClassesResultEvent(result:Object=null)
		{
			super(RESULT, false, true, result);
		}
	}
}