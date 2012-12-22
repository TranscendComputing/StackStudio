package com.momentumsi.c9.events.compute
{
	import mx.rpc.events.ResultEvent;
	
	public class DescribeReservedInstancesOfferingsResultEvent extends ResultEvent
	{
		public static const RESULT:String = "describeReservedInstancesOfferingsResult";
		
		public function DescribeReservedInstancesOfferingsResultEvent(result:Object=null)
		{
			super(RESULT, false, true, result);
		}
	}
}