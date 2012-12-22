package com.momentumsi.c9.events.storage
{
	import mx.rpc.Fault;
	import mx.rpc.events.FaultEvent;
	
	public class DescribeBucketsFaultEvent extends FaultEvent
	{
		public static const FAULT:String = "describeBucketsFault";
		
		public function DescribeBucketsFaultEvent(fault:Fault=null)
		{
			super(FAULT, false, false, fault);
		}
	}
}