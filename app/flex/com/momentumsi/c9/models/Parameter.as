package com.momentumsi.c9.models
{
	import mx.collections.ArrayCollection;

	[Bindable]
	public class Parameter extends Element
	{
		public static const STRING_TYPE:String = "String";
		public static const NUMBER_TYPE:String = "Number";
		public static const LIST_TYPE:String = "CommmaDelimitedList";
		
		public static const TYPES:ArrayCollection = new ArrayCollection([
			STRING_TYPE,
			NUMBER_TYPE,
			LIST_TYPE
			]);
		
		public var defaultValue:String;
		private var _noEcho:Boolean = false;
		private var _allowedValues:ArrayCollection = new ArrayCollection();
		public var allowedPattern:String;
		public var maxLength:String;
		public var minLength:String;
		public var maxValue:String;
		public var minValue:String;
		public var description:String;
		public var constraintDescription:String;
		
		public function Parameter(element:Element=null)
		{
			super();
			elementGroup = ELEMENT_GROUP_PARAMETER;
			elementType = STRING_TYPE;
		}
		
		override public function set properties(value:Object):void
		{
			elementType = value["Type"];
			defaultValue = value["Default"];
			_noEcho = value["NoEcho"];
			if(value.hasOwnProperty("AllowedValues"))
			{
				_allowedValues = new ArrayCollection(value["AllowedValues"] as Array);
			}
			allowedPattern = value["AllowedPattern"];
			if(elementType == STRING_TYPE)
			{
				maxLength = value["MaxLength"];
				minLength = value["MinLength"];
			}else if(elementType == NUMBER_TYPE)
			{
				maxValue = value["MaxValue"];
				minValue = value["MinValue"];
			}
			description = value["Description"];
			constraintDescription = value["ConstraintDescription"];
		}
		
		override public function get properties():Object
		{
			var properties:Object = new Object();
			properties["Type"] = elementType;
			if(elementType == STRING_TYPE)
			{
				if(maxLength)
				{
					properties["MaxLength"] = maxLength;
				}
				if(minLength)
				{
					properties["MinLength"] = minLength;
				}
			}else if(elementType == NUMBER_TYPE)
			{
				if(maxValue)
				{
					properties["MaxValue"] = maxValue;
				}
				if(minValue)
				{
					properties["MinValue"] = minValue;
				}
			}
			
			if(_noEcho)
			{
				properties["NoEcho"] = _noEcho;
			}
			if(_allowedValues.length > 0)
			{
				properties["AllowedValues"] = allowedValuesCollection;
			}
			
			if(allowedPattern)
			{
				properties["AllowedPattern"] = allowedPattern;
			}
			
			if(description)
			{
				properties["Description"] = description;
			}

			if(constraintDescription)
			{
				properties["ConstraintDescription"] = constraintDescription;
			}
			
			if(defaultValue)
			{
				properties["Default"] = defaultValue;
			}
			
			return properties;
		}
		
		public function get min():Object
		{
			return minValue || minLength || null;
		}
		
		public function set min(value:Object):void
		{
			if(elementType == NUMBER_TYPE)
			{
				minValue = value.toString();
			}else{
				minLength = value.toString();
			}
		}
		
		public function get max():Object
		{
			return maxValue || maxLength || null;
		}
		
		public function set max(value:Object):void
		{
			if(elementType == NUMBER_TYPE)
			{
				maxValue = value.toString();
			}else{
				maxLength = value.toString();
			}
		}
		
		public function get noEcho():Boolean
		{
			return _noEcho;
		}
		
		public function set noEcho(value:Boolean):void
		{
			_noEcho = value;
		}
		
		public function get allowedValues():String
		{
			return _allowedValues.toString();
		}
		
		public function get allowedValuesCollection():Array
		{
			return _allowedValues.source;
		}
		
		public function set allowedValues(values:String):void
		{
			_allowedValues = new ArrayCollection(values.split(","));
		}
	}
}