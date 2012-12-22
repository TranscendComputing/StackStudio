package com.momentumsi.c9.events.apiCloud
{
	import mx.rpc.Fault;
	import mx.rpc.events.FaultEvent;
	
	public class CloudQueryFaultEvent extends FaultEvent
	{
		public static const FAULT:String = "cloudQueryFault";
		
		public function CloudQueryFaultEvent(fault:Fault=null)
		{
			super(FAULT, false, true, fault);
		}
	}
}