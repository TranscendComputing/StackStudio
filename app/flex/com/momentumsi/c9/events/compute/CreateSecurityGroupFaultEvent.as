package com.momentumsi.c9.events.compute
{
	import mx.rpc.Fault;
	import mx.rpc.events.FaultEvent;
	
	public class CreateSecurityGroupFaultEvent extends FaultEvent
	{
		public static const FAULT:String = "createSecurityGroupFault";
		
		public function CreateSecurityGroupFaultEvent(fault:Fault=null)
		{
			super(FAULT, false, false, fault);
		}
	}
}