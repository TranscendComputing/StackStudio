package com.momentumsi.c9.models
{
	import com.adobe.serialization.json.JSON;

	public class Output extends Element
	{
		public var description:String;
		private var _value:Object;
		
		public function Output(element:Element=null)
		{
			if(element != null)
			{
				super(element.id, element.name, null, element.projectId);
			}
			elementGroup = ELEMENT_GROUP_OUTPUT;
			elementType = "Output";
		}
		
		override public function set properties(value:Object):void
		{
			description = value["Description"];
			_value = value["Value"];
		}
		
		public function get value():String
		{
			if(_value == null)
			{
				return new String();
			}else if(_value is String)
			{
				return _value.toString();
			}else{
				return JSON.encode(_value);
			}
		}
		
		public function set value(newValue:String):void
		{
			try
			{
				_value = JSON.decode(newValue);
			} 
			catch(error:Error) 
			{
				_value = newValue;
			}
		}
	}
}