package com.momentumsi.c9.events.rds
{
	import mx.messaging.messages.IMessage;
	import mx.rpc.AsyncToken;
	import mx.rpc.events.ResultEvent;
	
	public class RestoreFromSnapshotResultEvent extends ResultEvent
	{
		public static const RESULT:String = "restoreFromSnapshotResult"
			
		public function RestoreFromSnapshotResultEvent(result:Object=null)
		{
			super(RESULT, false, false, result);
		}
	}
}