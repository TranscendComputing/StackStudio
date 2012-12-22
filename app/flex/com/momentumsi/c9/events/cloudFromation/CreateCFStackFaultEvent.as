package com.momentumsi.c9.events.cloudFromation
{
	import mx.rpc.Fault;
	import mx.rpc.events.FaultEvent;
	
	public class CreateCFStackFaultEvent extends FaultEvent
	{
		public static const FAULT:String = "createCFStackFault";
		
		public function CreateCFStackFaultEvent(fault:Fault=null)
		{
			super(FAULT, false, true, fault);
		}
	}
}