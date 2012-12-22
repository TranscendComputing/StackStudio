package com.momentumsi.c9.events.compute
{
	import mx.rpc.events.ResultEvent;
	
	public class DescribeSpotPriceHistoryResultEvent extends ResultEvent
	{
		public static const RESULT:String = "describeSpotPriceHistoryResult";
		
		public function DescribeSpotPriceHistoryResultEvent(result:Object=null)
		{
			super(RESULT, false, true, result);
		}
	}
}