package com.momentumsi.c9.events.compute
{
	import mx.rpc.Fault;
	import mx.rpc.events.FaultEvent;
	
	public class GetRolesFaultEvent extends FaultEvent
	{
		public static const FAULT:String = "getRolesFault";
		
		public function GetRolesFaultEvent(fault:Fault=null)
		{
			super(FAULT, false, true, fault);
		}
	}
}