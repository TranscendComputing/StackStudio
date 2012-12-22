package com.momentumsi.c9.events.project
{
	import mx.rpc.events.ResultEvent;
	
	public class PromoteEnvironmentResultEvent extends ResultEvent
	{
		public static const RESULT:String = "promoteEnvironmentResult";
		
		public function PromoteEnvironmentResultEvent(result:Object=null)
		{
			super(RESULT, false, true, result);
		}
	}
}