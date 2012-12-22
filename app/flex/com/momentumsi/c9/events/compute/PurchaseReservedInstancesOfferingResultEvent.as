package com.momentumsi.c9.events.compute
{
	import mx.rpc.events.ResultEvent;
	
	public class PurchaseReservedInstancesOfferingResultEvent extends ResultEvent
	{
		public static const RESULT:String = "purchaseReservedInstancesOfferingResult";
		
		public function PurchaseReservedInstancesOfferingResultEvent(result:Object=null)
		{
			super(RESULT, false, true, result);
		}
	}
}