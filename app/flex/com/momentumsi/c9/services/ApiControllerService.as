package com.momentumsi.c9.services
{
	import mx.controls.Alert;
	import mx.core.FlexGlobals;
	import mx.rpc.AsyncToken;
	import mx.rpc.events.FaultEvent;
	import mx.rpc.events.ResultEvent;
	
	public class ApiControllerService extends ApiService
	{
		public var action:String;
		private var userId:String;
		
		public function ApiControllerService(rootURL:String=null, destination:String=null)
		{
			super(rootURL, destination);	
			addEventListener(FaultEvent.FAULT, faultHandler)
		}
		
		private function faultHandler(event:FaultEvent):void
		{
			if(fault != null)
			{
				var errorMessage:String = fault.message;
				if(errorMessage != "")
				{
					Alert.show(fault.message, fault.title);
				}
			}
		}
		
		public function setUrl():void
		{
			var date:Date = new Date();
			var topApp:C9 = C9(FlexGlobals.topLevelApplication);
			userId = topApp.user.id;
			if(serviceUrl == null)
			{
				serviceUrl = topApp.GetConfiguration("serviceUrl");
			}
			this.url = serviceUrl + "/api/" + userId + "/" + action + "?" + date.toString();
			this.method = "POST";
		}
		
		override public function send(parameters:Object=null):AsyncToken
		{
			setUrl();
			return super.send(parameters);
		}
	}
}