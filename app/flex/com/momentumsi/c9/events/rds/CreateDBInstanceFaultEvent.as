package com.momentumsi.c9.events.rds
{
	import mx.rpc.Fault;
	import mx.rpc.events.FaultEvent;
	
	public class CreateDBInstanceFaultEvent extends FaultEvent
	{
		public static const FAILED:String = "dbInstanceFailed";
		public function CreateDBInstanceFaultEvent(fault:Fault=null)
		{
			super(FAILED, false, false, fault);
		}
	}
}