package com.momentumsi.c9.models.resources
{
	[Bindable]
	public class ParameterGroupParam
	{
		private var _name:String;
		private var _value:String;
		private var _allowedValues:String;
		private var _isModifiable:Boolean;
		private var _source:String;
		private var _type:String;
		private var _description:String;
		private var _applyType:String;
		
		public var isChanged:Boolean = false;
		public var previousValue:String;
		
		public function ParameterGroupParam(parameter:Object)
		{
			if(parameter.parameter_name == null)
			{
				this.name = parameter.name;
			}else{
				this.name = parameter.parameter_name;
			}
			if(parameter.allowed_values == "")
			{
				this.allowedValues = "";
			}else
			{
				this.allowedValues = parameter.allowed_values;
			}
			if(parameter.is_modifiable == null)
			{
				this.isModifiable = parameter.modifiable;
			}else{
				this.isModifiable = parameter.is_modifiable;
			}
			this.source = parameter.source;
			if(parameter.apply_type == "")
			{
				this.applyType = "";
			}else
			{
				this.applyType = parameter.apply_type;
			}
			if(parameter.data_type == "")
			{
				this.type = "";
			}else
			{
				this.type = parameter.data_type;
			}
			this.description = parameter.description;
			if(parameter.value == null)
			{
				this.value = parameter.parameter_value;
			}else{
				this.value = parameter.value;
			}
			this.previousValue = parameter.value;
		}
		
		public function get name():String
		{
			return _name;
		}
		
		public function set name(value:String):void
		{
			_name = value;
		}
		
		public function get value():String 
		{
			return _value;
		}
		
		public function set value(value:String):void 
		{
			_value = value;
		}
		
		public function get allowedValues():String 
		{
			return _allowedValues;
		}
		
		public function set allowedValues(value:String):void 
		{
			_allowedValues = value;
		}
		
		public function get isModifiable():String 
		{
			return _isModifiable.toString();
		}
		
		public function set isModifiable(value:String):void 
		{
			_isModifiable = Boolean(value);
		}
		
		public function get source():String 
		{
			return _source;
		}
		
		public function set source(value:String):void 
		{
			_source = value;
		}
		
		public function get type():String 
		{
			return _type;
		}
		
		public function set type(value:String):void
		{
			_type = value;
		}
		
		public function get applyType():String
		{
			return _applyType;
		}
		
		public function set applyType(value:String):void 
		{
			_applyType = value;
		}
		
		public function get description():String 
		{
			return _description;
		}
		
		public function set description(value:String):void 
		{
			_description = value;
		}
	}
}