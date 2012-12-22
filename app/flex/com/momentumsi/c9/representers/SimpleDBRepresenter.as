package com.momentumsi.c9.representers
{
	[Bindable]
	public class SimpleDBRepresenter extends RepresenterBase
	{
		public function SimpleDBRepresenter(data:Object)
		{
			super(data);
		}
		
		public function get name():String
		{
			return data.DomainName;
		}
		
		public function get itemCount():String
		{
			return data.ItemCount;
		}
		
		public function get itemNamesSizeBytes():String
		{
			return data.ItemNamesSizeBytes;
		}
		
		public function get attributeNameCount():String
		{
			return data.AttributeNameCount;
		}
		
		public function get attributeNamesSizeBytes():String
		{
			return data.AttributeNamesSizeBytes;
		}
		
		public function get attributeValueCount():String
		{
			return data.AttributeValueCount;
		}
		
		public function get attributeValuesSizeBytes():String
		{
			return data.AttributeValuesSizeBytes;
		}
		
		public function get boxUsage():String
		{
			return data.BoxUsage;
		}
	}
}