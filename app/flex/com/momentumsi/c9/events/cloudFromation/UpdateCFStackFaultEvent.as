package com.momentumsi.c9.events.cloudFromation
{
	import mx.rpc.Fault;
	import mx.rpc.events.FaultEvent;
	
	public class UpdateCFStackFaultEvent extends FaultEvent
	{
		public static const FAULT:String = "updateCFStackFault";
		
		public function UpdateCFStackFaultEvent(fault:Fault=null)
		{
			super(FAULT, false, true, fault);
		}
	}
}