package com.momentumsi.c9.representers
{
	import com.momentumsi.c9.utils.Helpers;
	import spark.formatters.DateTimeFormatter;
	
	[Bindable]
	public class MessageQueueRepresenter extends RepresenterBase
	{		
		public function MessageQueueRepresenter(data:Object)
		{
			super(data);
			dateFormatter.dateTimePattern = "MM/dd/yyyy hh:mm:ss a";
		}
		
		public function get name():String
		{
			return data.QueueName;
		}
		
		public function get queueUrl():String
		{
			return data.QueueUrl;
		}
		
		public function get visibilityTimeout():int
		{
			return data.VisibilityTimeout;
		}
		
		public function get approximateNumberOfMessages():int
		{
			return data.ApproximateNumberOfMessages;
		}
		
		public function get approximateNumberOfMessagesNotVisible():int
		{
			return data.ApproximateNumberOfMessagesNotVisible;
		}
		
		public function get lastModified():String
		{
			return dateFormatter.format(Helpers.formatDate(data.LastModifiedTimestamp));
		}
		
		public function get queueResourceName():String
		{
			return data.QueueArn;
		}
		
		public function get maxMessageSize():int
		{
			return data.MaximumMessageSize;
		}
		
		public function get messageRetentionPeriod():int
		{
			return data.MessageRetentionPeriod;
		}
		
		public function get delaySeconds():int
		{
			return data.DelaySeconds;
		}
	}
}