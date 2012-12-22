package com.momentumsi.c9.events.rds
{
	import mx.rpc.events.ResultEvent;
	
	public class CreateDBInstanceResultEvent extends ResultEvent
	{
		public static const CREATED:String = "dbInstanceCreated";
		public function CreateDBInstanceResultEvent(result:Object=null)
		{
			super(CREATED, false, false, result);
		}
	}
}