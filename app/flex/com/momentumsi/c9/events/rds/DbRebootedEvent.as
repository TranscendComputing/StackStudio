package com.momentumsi.c9.events.rds
{
	import mx.rpc.events.ResultEvent;
	
	public class DbRebootedEvent extends ResultEvent
	{
		public static const REBOOTED:String = "dbRebooted";
		
		public function DbRebootedEvent(result:Object=null)
		{
			super(REBOOTED, false, false, result);
		}
	}
}