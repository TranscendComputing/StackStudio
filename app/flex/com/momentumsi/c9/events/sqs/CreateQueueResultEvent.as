package com.momentumsi.c9.events.sqs
{
	import mx.rpc.events.ResultEvent;
	
	public class CreateQueueResultEvent extends ResultEvent
	{
		public static const RESULT:String = "createQueueResult";
		
		public function CreateQueueResultEvent(result:Object=null)
		{
			super(RESULT, true, true, result);
		}
	}
}