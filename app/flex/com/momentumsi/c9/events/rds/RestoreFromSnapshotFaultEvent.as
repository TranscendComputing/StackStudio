package com.momentumsi.c9.events.rds
{
	import mx.rpc.Fault;
	import mx.rpc.events.FaultEvent;
	
	public class RestoreFromSnapshotFaultEvent extends FaultEvent
	{
		public static const FAULT:String = "restoreFromSnapshotFault";
		
		public function RestoreFromSnapshotFaultEvent(fault:Fault=null)
		{
			super(FAULT, false, false, fault);
		}
	}
}