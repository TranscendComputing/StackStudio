package com.momentumsi.c9.events.cloudFromation
{
	import mx.rpc.events.ResultEvent;
	
	public class DescribeStackEventsResultEvent extends ResultEvent
	{
		public static const RESULT:String = "describeStackEventsResult";
		
		public function DescribeStackEventsResultEvent(result:Object=null)
		{
			super(RESULT, false, false, result);
		}
	}
}