package com.momentumsi.c9.events.provisionedVersion
{
	import com.momentumsi.c9.models.ProvisionedInstance;
	
	import mx.messaging.messages.IMessage;
	import mx.rpc.AsyncToken;
	import mx.rpc.events.ResultEvent;
	
	public class UpdateProvisionedInstanceResultEvent extends ResultEvent
	{
		public static const RESULT:String = "updateProvisionedInstanceResult";
		
		public function UpdateProvisionedInstanceResultEvent(result:Object=null)
		{
			super(RESULT, false, false, result);
		}
	}
}