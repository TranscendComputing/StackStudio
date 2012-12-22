package com.momentumsi.c9.representers
{
	import com.momentumsi.c9.utils.Helpers;
	
	import flash.events.EventDispatcher;
	
	import spark.formatters.DateTimeFormatter;

	[Bindable]
	public class RepresenterBase extends EventDispatcher
	{
		protected static const UNAVAILABLE:String = "Unavailable";
		public var data:Object;
		protected var dateFormatter:DateTimeFormatter = new DateTimeFormatter();

		public function RepresenterBase(data:Object)
		{
			this.data = data;
			dateFormatter.dateTimePattern = "MM/dd/yyyy hh:mm:ss a";
		}
		
		
		public function get createdAt():String
		{
			var dateString:String;
			if(data.created_at != null)
			{
				dateString = data.created_at;					
			}else if(data.created != null)
			{
				dateString = data.created;
			}else if(data.create_time != null)
			{
				dateString = data.create_time;
			}else if(data.CreatedTime != null)
			{
				dateString = data.CreatedTime;
			}else if(data.CreatedTimestamp)
			{
				dateString = data.CreatedTimestamp
			}else if(data.CreationTime)
			{
				dateString = data.CreationTime;
			}
			
			if(dateString != null)
			{
				return dateFormatter.format(Helpers.formatDate(dateString));
			}else{
				return new String;
			}
		}
		
		public function get updatedAt():String
		{
			var dateString:String;
			if(data.updated_at != null)
			{
				dateString = data.updated_at;					
			}else if(data.updated != null)
			{
				dateString = data.updated;
			}
			
			if(dateString != null)
			{
				return dateFormatter.format(Helpers.formatDate(dateString));
			}else{
				return new String;
			}
		}
		
	}
}