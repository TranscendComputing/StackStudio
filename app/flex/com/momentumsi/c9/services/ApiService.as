package com.momentumsi.c9.services
{
	import com.adobe.net.URI;
	import com.adobe.serialization.json.JSON;
	import com.maccherone.json.JSON;
	import com.momentumsi.c9.events.LoginEvent;
	import com.momentumsi.c9.loggers.CustomLogger;
	import com.momentumsi.c9.serializers.JSONSerializationFilter;
	
	import flash.net.URLRequestMethod;
	import flash.utils.ByteArray;
	
	import mx.controls.Alert;
	import mx.core.FlexGlobals;
	import mx.logging.LogEvent;
	import mx.rpc.AsyncToken;
	import mx.rpc.Fault;
	import mx.rpc.events.FaultEvent;
	import mx.rpc.events.ResultEvent;
	import mx.rpc.http.mxml.HTTPService;
	
	[Bindable]
	public class ApiService extends HTTPService
	{		
		public static const CONTENT_TYPE_JSON:String = "application/json";
		public var result:Object;
		public var serviceUrl:String;
		public var fault:Object;
		private var logUrl:String;
		public function ApiService(rootURL:String=null, destination:String=null)
		{
			super(rootURL, destination);
			resultFormat = "text";
			var topApp:C9 = C9(FlexGlobals.topLevelApplication);			
			url = topApp.GetConfiguration("apiHost");			
			serviceUrl = topApp.GetConfiguration("serviceUrl");
			logUrl = serviceUrl + "/logging/log_external_message";
			addEventListener(ResultEvent.RESULT, handleApiResult);
			addEventListener(FaultEvent.FAULT, handleFault);
			//addEventListener(FaultEvent.FAULT, logFaults);
		}

		private function handleApiResult(event:ResultEvent):void
		{
			try
			{
				result = com.maccherone.json.JSON.decode(event.result.toString());
			}catch(error:Error) 
			{
				try
				{
					result = com.adobe.serialization.json.JSON.decode(event.result.toString());
				}catch(error:Error) 
				{
					try
					{
						result = event.result.toString();
					}catch(error:Error)
					{
						
					}
				}
			}
		}
		
		private function handleFault(event:FaultEvent):void
		{
			try
			{
				fault = com.maccherone.json.JSON.decode(event.fault.content.toString());
			} 
			catch(error:Error) 
			{
				trace("Error:  " + error);
				trace("Fault:  " + event.fault);
			}
		}
		
		private function logFaults(event:FaultEvent):void
		{
			var logService:HTTPService = new HTTPService();
			logService.url = logUrl;
			logService.method = URLRequestMethod.POST; 
			logService.resultFormat="e4x";
			logService.addEventListener(FaultEvent.FAULT, cancelService);
			logService.send({message: event.fault.faultString});
			
		}
		
		private function cancelService(event:FaultEvent):void
		{
			// Do nothing
		}
		
		// Helper methods
		public function setPost():void
		{
			var customHeaders:Object = new Object();
			customHeaders["Cache-Control"] = "no-cache";
			customHeaders["Content-Type"] = CONTENT_TYPE_JSON;
			headers = customHeaders;
			method = URLRequestMethod.POST;
			contentType = CONTENT_TYPE_JSON;
			useProxy = false;
			serializationFilter = new JSONSerializationFilter();
		}
	}
}