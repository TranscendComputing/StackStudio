package com.momentumsi.c9.events.cloudFromation
{
	import mx.rpc.events.ResultEvent;
	
	public class DescribeStacksResultEvent extends ResultEvent
	{
		public static const RESULT:String = "describeStacksResult";
		
		public function DescribeStacksResultEvent(result:Object=null)
		{
			super(RESULT, false, true, result);
		}
	}
}