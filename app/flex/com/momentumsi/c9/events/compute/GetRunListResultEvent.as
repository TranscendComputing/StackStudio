package com.momentumsi.c9.events.compute
{
	import mx.rpc.events.ResultEvent;
	
	public class GetRunListResultEvent extends ResultEvent
	{
		public static const RESULT:String = "getRunListResult";
		
		public function GetRunListResultEvent(result:Object=null)
		{
			super(RESULT, false, true, result);
		}
	}
}