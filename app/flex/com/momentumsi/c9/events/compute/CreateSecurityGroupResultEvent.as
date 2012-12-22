package com.momentumsi.c9.events.compute
{
	import mx.rpc.events.ResultEvent;
	
	public class CreateSecurityGroupResultEvent extends ResultEvent
	{
		public static const RESULT:String = "createSecurityGroupResult";
		
		public function CreateSecurityGroupResultEvent(result:Object=null)
		{
			super(RESULT, false, false, result);
		}
	}
}