package com.momentumsi.c9.representers
{
	[Bindable]
	public class HostedZoneRepresenter extends RepresenterBase
	{
		public function HostedZoneRepresenter(data:Object)
		{
			super(data);
		}
		
		public function get name():String
		{
			return data.Name;
		}
		
		public function get id():String
		{
			return data.Id;
		}
		
		public function get callerReference():String
		{
			return data.CallerReference;
		}
		
		public function get comment():String
		{
			return data.Comment;
		}
	}
}