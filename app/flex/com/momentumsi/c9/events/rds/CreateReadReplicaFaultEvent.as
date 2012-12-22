package com.momentumsi.c9.events.rds
{
	import mx.messaging.messages.IMessage;
	import mx.rpc.AsyncToken;
	import mx.rpc.Fault;
	import mx.rpc.events.FaultEvent;
	
	public class CreateReadReplicaFaultEvent extends FaultEvent
	{
		public static const READ_REPLICA_FAILED:String = "readReplicaFailed";
		
		public function CreateReadReplicaFaultEvent(fault:Fault=null)
		{
			super(READ_REPLICA_FAILED, false, false, fault);
		}
	}
}