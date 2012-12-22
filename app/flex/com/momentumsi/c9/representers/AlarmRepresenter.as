package com.momentumsi.c9.representers
{
	import com.momentumsi.c9.utils.Helpers;
	
	import mx.collections.ArrayCollection;
	import mx.utils.StringUtil;
	
	import spark.formatters.DateTimeFormatter;
	
	[Bindable]
	public class AlarmRepresenter extends RepresenterBase
	{
		public var dimensionsCollection:ArrayCollection;
		public function AlarmRepresenter(data:Object)
		{
			super(data);
			dimensionsCollection = new ArrayCollection(data.Dimensions as Array);
			dateFormatter.dateTimePattern = "MM/dd/yyyy hh:mm:ss a";
		}
		
		public function get name():String
		{
			return data.AlarmName;
		}
		
		public function get dimensions():String
		{
			var dimensionsArray:Array = [];
			for each(var d:Object in dimensionsCollection)
			{
				var dString:String = d.Name + ": " + d.Value;
				dimensionsArray.push(dString);
			}
			return dimensionsArray.join(",\n");
		}
		
		public function get description():String
		{
			return data.AlarmDescription;
		}
		
		public function get stateUpdatedTimestamp():String
		{
			if(data.StateUpdatedTimestamp != null)
			{
				return dateFormatter.format(Helpers.formatDate(data.StateUpdatedTimestamp));
			}else{
				return new String;
			}
		}
		
		public function get insufficientDataActions():String
		{
			return data.InsufficientDataActions;
		}
		
		public function get alarmResourceName():String
		{
			return data.AlarmArn;
		}
		
		public function get alarmConfigurationUpdatedTimestamp():String
		{
			if(data.AlarmConfigurationUpdatedTimestamp != null)
			{
				return dateFormatter.format(Helpers.formatDate(data.AlarmConfigurationUpdatedTimestamp));
			}else{
				return new String;
			}
		}
		
		public function get state():String
		{
			return data.StateValue;
		}
		
		public function get period():String
		{
			return data.Period;
		}
		
		public function get okActions():String
		{
			return data.OKActions;
		}
		
		public function get actionsEnabled():String
		{
			return data.ActionsEnabled;
		}
		
		public function get namespace():String
		{
			return data.Namespace;
		}
		
		public function get threshold():String
		{
			var comparisonSign:String = "";
			switch(data.ComparisonOperator)
			{
				case "GreaterThanOrEqualToThreshold":
					comparisonSign = ">="
					break;
				case "LessThanOrEqualToThreshold":
					comparisonSign = "<="
					break;
				case "GreaterThanThreshold":
					comparisonSign = ">"
					break;
				case "LessThanThreshold":
					comparisonSign = "<"
					break;
			}
			var timeLength:String = (data.Period * data.EvaluationPeriods/60).toString();
			return data.MetricName + " " + comparisonSign + " " + data.Threshold.toString() + " " + data.Unit + " for " + timeLength + " minutes."
		}
		
		public function get evaluationPeriods():String
		{
			return data.EvaluationPeriods;
		}
		
		public function get statistic():String
		{
			return data.Statistic;
		}
		
		public function get alarmActions():String
		{
			return data.AlarmActions;
		}
		
		public function get unit():String
		{
			return data.Unit;
		}
		
		public function get stateReason():String
		{
			return data.StateReason;
		}
		
		public function get comparisonOperator():String
		{
			return data.ComparisonOperator;
		}
		
		public function get metricName():String
		{
			return data.MetricName;
		}
	}
}