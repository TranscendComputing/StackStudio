package com.momentumsi.c9.events.apiIdentity
{
	import mx.rpc.Fault;
	import mx.rpc.events.FaultEvent;
	
	public class UpdateCloudAccountFaultEvent extends FaultEvent
	{
		public static const FAULT:String = "updateCloudAccountFault";
		
		public function UpdateCloudAccountFaultEvent(fault:Fault=null)
		{
			super(FAULT, false, true, fault);
		}
	}
}