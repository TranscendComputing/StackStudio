package com.momentumsi.c9.events.apiIdentity
{
	import mx.rpc.Fault;
	import mx.rpc.events.FaultEvent;
	
	public class DeleteCloudAccountFaultEvent extends FaultEvent
	{
		public static const FAULT:String = "deleteCloudAccountFault";
		
		public function DeleteCloudAccountFaultEvent(fault:Fault=null)
		{
			super(FAULT, false, true, fault);
		}
	}
}