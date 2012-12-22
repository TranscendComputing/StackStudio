package com.momentumsi.c9.loggers
{
	import com.momentumsi.c9.utils.Helpers;
	
	import mx.core.mx_internal;
	import mx.logging.ILogger;
	import mx.logging.Log;
	import mx.logging.LogEvent;
	import mx.logging.LogEventLevel;
	import mx.logging.targets.LineFormattedTarget;
	import mx.rpc.events.FaultEvent;
	import mx.rpc.http.mxml.HTTPService;

	use namespace mx_internal;
	
	public class CustomLogger extends LineFormattedTarget 
	{				
		public function CustomLogger()
		{
			super();
			
			// change the defaults for these
			super.fieldSeparator = "##";
			super.includeTime = true;
			super.includeDate = true;
			super.includeCategory = true;
			super.includeLevel = true;
			super.level = LogEventLevel.ALL;
		}
		
		public override function logEvent(event:LogEvent):void{
			var category:String = ILogger(event.target).category;
			if(category.indexOf("mx.") != 0){
				super.logEvent(event);
			}
		}
		
		mx_internal override function internalLog(message:String):void{
			var logToServer:HTTPService = new HTTPService();
			logToServer.url = Helpers.getHost() + "/logging/log_external_message";
			logToServer.method = "POST";
			logToServer.addEventListener(FaultEvent.FAULT, faultHandler);
			logToServer.send({message: message});
		}
		
		private function faultHandler(event:FaultEvent):void
		{
			// Unable to connect and write to server logs
		}
	}
}