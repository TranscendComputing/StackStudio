package com.momentumsi.c9.events.rds
{
	import mx.rpc.Fault;
	import mx.rpc.events.FaultEvent;
	
	public class CreateDBSecurityGroupFaultEvent extends FaultEvent
	{
		public static const FAULT:String = "createDBSecurityGroupFault";
		public function CreateDBSecurityGroupFaultEvent(fault:Fault=null)
		{
			super(FAULT, false, false, fault);
		}
	}
}