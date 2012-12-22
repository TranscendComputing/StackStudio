package com.momentumsi.c9.models.resources
{
	import com.momentumsi.c9.constants.ResourceType;
	import com.momentumsi.c9.models.Element;
	
	public class ASTrigger extends Element
	{
		[Bindable]
		public var dimensions:Object
		[Bindable]
		public var metricName:Object
		[Bindable]
		public var namespace:Object
		[Bindable]
		public var period:Object
		[Bindable]
		public var statistic:Object
		[Bindable]
		public var unit:Object
		[Bindable]
		public var upperBreachScaleIncrement:Object
		[Bindable]
		public var lowerBreachScaleIncrement:Object
		[Bindable]
		public var autoScalingGroupName:Object
		[Bindable]
		public var breachDuration:Object
		[Bindable]
		public var upperThreshold:Object
		[Bindable]
		public var lowerThreshold:Object

		public function ASTrigger(element:Element=null)
		{
			if(element)
			{
				super(element.id, element.name, element.elementType, element.projectId);
				properties = element.properties;
			}
			elementGroup = ELEMENT_GROUP_RESOURCE;
			elementType = ResourceType.AS_TRIGGER;			
		}
		
		private var _properties:Object;
		override public function get properties():Object
		{
			_properties = new Object();
			
			if(unit != null)
			{
				_properties["Unit"] = unit;
			}
			
			if(dimensions != null)
			{
				_properties["Dimensions"] = dimensions;
			}
			
			if(metricName != null)
			{
				_properties["MetricName"] = metricName;
			}
			
			if(namespace != null)
			{
				_properties["Namespace"] = namespace;
			}
			
			if(period != null)
			{
				_properties["Period"] = period;
			}
			
			if(statistic != null)
			{
				_properties["Statistic"] = statistic;
			}
			
			if(upperBreachScaleIncrement != null)
			{
				_properties["UpperBreachScaleIncrement"] = upperBreachScaleIncrement;
			}
			
			if(lowerBreachScaleIncrement != null)
			{
				_properties["LowerBreachScaleIncrement"] = lowerBreachScaleIncrement;
			}
			
			if(autoScalingGroupName != null)
			{
				_properties["AutoScalingGroupName"] = autoScalingGroupName;
			}
			
			if(breachDuration != null)
			{
				_properties["BreachDuration"] = breachDuration;
			}
			
			if(upperThreshold != null)
			{
				_properties["UpperThreshold"] = upperThreshold;
			}
			
			if(lowerThreshold != null)
			{
				_properties["LowerThreshold"] = lowerThreshold;
			}
			
			var props:Object = _properties;
			_properties = new Object();
			_properties["Properties"] = props;
			
			_properties["Type"] = elementType;
			
			return _properties;
		}
		
		override public function set properties(value:Object):void
		{
			value = value["Properties"];
			dimensions = value["Dimensions"];
			metricName = value["MetricName"];
			period = value["Period"];
			statistic = value["Statistic"];
			upperBreachScaleIncrement = value["UpperBreachScaleIncrement"];
			lowerBreachScaleIncrement = value["LowerBreachScaleIncrement"];
			autoScalingGroupName = value["AutoScalingGroupName"];
			breachDuration = value["BreachDuration"];
			upperThreshold = value["UpperThreshold"];
			lowerThreshold = value["LowerThreshold"];
			unit = value["Unit"];
			
			_properties = value;
		}
												
	}
}