package com.momentumsi.c9.events.rds
{
	import mx.rpc.events.ResultEvent;
	
	public class CreateDBSecurityGroupResultEvent extends ResultEvent
	{
		public static const RESULT:String = "createDBSecurityGroupResult";
		public function CreateDBSecurityGroupResultEvent(result:Object=null)
		{
			super(RESULT, false, false, result);
		}
	}
}