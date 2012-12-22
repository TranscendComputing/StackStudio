package com.momentumsi.c9.events.sqs
{
	import mx.rpc.events.ResultEvent;
	
	public class SetQueueAttributesResultEvent extends ResultEvent
	{
		public static const RESULT:String = "setQueueAttributesResult";
		
		public function SetQueueAttributesResultEvent(result:Object=null)
		{
			super(RESULT, true, true, result);
		}
	}
}