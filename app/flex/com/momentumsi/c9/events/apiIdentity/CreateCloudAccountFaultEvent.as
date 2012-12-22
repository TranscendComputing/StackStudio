package com.momentumsi.c9.events.apiIdentity
{
	import mx.rpc.Fault;
	import mx.rpc.events.FaultEvent;
	
	public class CreateCloudAccountFaultEvent extends FaultEvent
	{
		public static const FAULT:String = "createCloudAccountFault";
		
		public function CreateCloudAccountFaultEvent(fault:Fault=null)
		{
			super(FAULT, false, true, fault);
		}
	}
}