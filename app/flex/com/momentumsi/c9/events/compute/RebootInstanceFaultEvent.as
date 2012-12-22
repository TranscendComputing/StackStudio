package com.momentumsi.c9.events.compute
{
	import mx.rpc.Fault;
	import mx.rpc.events.FaultEvent;
	
	public class RebootInstanceFaultEvent extends FaultEvent
	{
		public static const FAULT:String = "rebootInstanceFault";
		
		public function RebootInstanceFaultEvent(fault:Fault=null)
		{
			super(FAULT, false, true, fault);
		}
	}
}