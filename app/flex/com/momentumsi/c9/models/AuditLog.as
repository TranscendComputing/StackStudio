package com.momentumsi.c9.models
{
	import com.momentumsi.c9.utils.Helpers;
	
	import mx.collections.ArrayCollection;
	import mx.formatters.DateFormatter;
	
	import spark.formatters.DateTimeFormatter;

	[Bindable]
	public class AuditLog
	{
		public var physicalResourceId:String;
		public var logicalResourceId:String;
		public var serviceType:String;
		public var action:String;
		public var parameters:ArrayCollection = new ArrayCollection();
		public var responseStatusCode:Number;
		public var errors:Object;
		public var date:Date;
		public var accountName:String;
				
		public function AuditLog(log:Object, accountName:String)
		{
			physicalResourceId = log.physical_resource_id;
			logicalResourceId = log.logical_resource_id;
			serviceType = log.service_type;
			action = log.action;
			
			for(var p:* in log.parameters)
			{
				parameters.addItem({name: p, value: log.parameters[p]});
			}
			
			responseStatusCode = log.response_status_code;
			errors = log.errors;
			date = _formatDateString(log.date);
			this.accountName = accountName;
		}
		
		private function _formatDateString(dateString:String):Date
		{
			var split:Array = dateString.split(" ");
			var finalDate:String = split[0].toString().replace(/\-/g, "/");
			var finalTime:String = split[1].toString();
			var finalTimeZone:String = "GMT" + split[2];
			
			var formattedDate:String = finalDate + " " + finalTime + " " + finalTimeZone;
			var dateInMilliseconds:Number = Date.parse(formattedDate);
			var dateObj:Date = new Date();
			dateObj.setTime(dateInMilliseconds);
			return dateObj;
		}
	}
}