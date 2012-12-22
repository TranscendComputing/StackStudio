package com.momentumsi.c9.events.storage
{
	import mx.rpc.events.ResultEvent;
	
	public class DescribeBucketsResultEvent extends ResultEvent
	{
		public static const RESULT:String = "describeBucketsResult";
		
		public function DescribeBucketsResultEvent(result:Object=null)
		{
			super(RESULT, false, false, result);
		}
	}
}