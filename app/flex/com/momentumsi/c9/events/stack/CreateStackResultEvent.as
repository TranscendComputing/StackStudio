package com.momentumsi.c9.events.stack
{
	import mx.rpc.events.ResultEvent;
	
	public class CreateStackResult extends ResultEvent
	{
		public static const RESULT:String = "createStackResult";
		
		public function createStackResultEvent(result:Object=null)
		{
			super(RESULT, false, false, result);
		}
	}
}