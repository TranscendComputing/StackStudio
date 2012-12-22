package com.momentumsi.c9.events.org
{
	import com.momentumsi.c9.models.Org;
	
	import mx.collections.ArrayCollection;
	import mx.messaging.messages.IMessage;
	import mx.rpc.AsyncToken;
	import mx.rpc.events.ResultEvent;
	
	public class GetOrgDetailsResultEvent extends ResultEvent
	{
		public static const RESULT:String = "getOrgDetailsResult";
		public var organization:Org;
		public function GetOrgDetailsResultEvent(result:Object=null)
		{
			organization = Org.buildOrg(result.org); 
			super(RESULT, false, true, organization);
		}
	}
}