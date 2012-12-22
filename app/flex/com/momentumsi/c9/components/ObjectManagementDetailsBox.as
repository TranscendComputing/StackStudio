package com.momentumsi.c9.components
{
	import com.momentumsi.c9.events.CloudAccountSetEvent;
	import com.momentumsi.c9.models.CloudAccount;
	
	import spark.components.VGroup;
	import spark.formatters.DateTimeFormatter;
	
	[Event(name="cloudAccountSet", type="com.momentumsi.c9.events.CloudAccountSetEvent")]
	
	[Bindable]
	public class ObjectManagementDetailsBox extends VGroup
	{
		private var _cloudAccount:CloudAccount;
		private var _resourceData:Object;
		public var region:String;
		public var dateFormatter:DateTimeFormatter = new DateTimeFormatter();
		
		public function ObjectManagementDetailsBox()
		{
			super();
			dateFormatter.dateTimePattern = "MM/dd/yyyy hh:mm:ss a";
			super.percentWidth = 100;
			super.percentHeight = 100;
		}
		
		public function get cloudAccount():CloudAccount
		{
			return _cloudAccount;
		}
		
		public function set cloudAccount(value:CloudAccount):void
		{
			_cloudAccount = value;
			dispatchEvent(new CloudAccountSetEvent(_cloudAccount));
		}
		
		public function get resourceData():Object
		{
			return _resourceData;
		}
		
		public function set resourceData(value:Object):void
		{
			_resourceData = value;
		}
		
	}
}