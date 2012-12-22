package com.momentumsi.c9.events.provisionedVersion
{
	import mx.rpc.Fault;
	import mx.rpc.events.FaultEvent;
	
	public class UpdateProvisionedInstanceFaultEvent extends FaultEvent
	{
		public static const FAULT:String = "updateProvisionedInstanceFault";
		public function UpdateProvisionedInstanceFaultEvent(fault:Fault=null)
		{
			super(FAULT, false, false, fault);
		}
	}
}