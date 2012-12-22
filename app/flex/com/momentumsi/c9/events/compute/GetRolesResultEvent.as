package com.momentumsi.c9.events.compute
{
	import mx.rpc.events.ResultEvent;
	
	public class GetRolesResultEvent extends ResultEvent
	{
		public static const RESULT:String = "getRolesResult";
		
		public function GetRolesResultEvent(result:Object=null)
		{
			super(RESULT, false, true, result);
		}
	}
}