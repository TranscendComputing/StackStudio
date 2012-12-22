package com.momentumsi.c9.events.rds
{
	import mx.messaging.messages.IMessage;
	import mx.rpc.AsyncToken;
	import mx.rpc.events.ResultEvent;
	
	public class CreateReadReplicaResultEvent extends ResultEvent
	{
		public static const READ_REPLICA_CREATED:String = "readReplicaCreated";
		
		public function CreateReadReplicaResultEvent(result:Object=null)
		{
			super(READ_REPLICA_CREATED, false, false, result);
		}
	}
}