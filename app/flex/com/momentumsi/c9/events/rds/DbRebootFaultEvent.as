package com.momentumsi.c9.events.rds
{
	import mx.messaging.messages.IMessage;
	import mx.rpc.AsyncToken;
	import mx.rpc.Fault;
	import mx.rpc.events.FaultEvent;
	
	public class DbRebootFaultEvent extends FaultEvent
	{
		public static const REBOOT_FAILED:String = "dbRebootFailed";
		
		public function DbRebootFaultEvent(fault:Fault=null)
		{
			super(REBOOT_FAILED, false, false, fault);
		}
	}
}