package com.momentumsi.c9.events.storage
{
	import mx.rpc.Fault;
	import mx.rpc.events.FaultEvent;
	
	public class CreateBucketFaultEvent extends FaultEvent
	{
		public static const FAULT:String = "createBucketFault";
		
		public function CreateBucketFaultEvent(fault:Fault=null)
		{
			super(FAULT, false, true, fault);
		}
	}
}