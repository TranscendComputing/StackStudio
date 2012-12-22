package com.momentumsi.c9.models
{
	import com.maccherone.json.JSON;
	import com.maccherone.json.JSONParseError;

	[Bindable]
	public class MappingEntry
	{
		public var key:String;
		private var _value:Object;
		
		public function MappingEntry(entry:Array)
		{
			key = entry[0];
			_value = entry[1];
		}
		
		public function get value():Object
		{
			if(_value is String)
			{
				return String(_value);
			}else{
				return JSON.encode(_value);
			}		
		}
		
		public function set value(item:Object):void
		{
			try
			{
				_value = JSON.decode(String(item));
			} 
			catch(error:JSONParseError) 
			{
				_value = String(item);
			}
		}
	}
}