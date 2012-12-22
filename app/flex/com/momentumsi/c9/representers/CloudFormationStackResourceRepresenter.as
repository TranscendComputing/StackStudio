package com.momentumsi.c9.representers
{
	import com.momentumsi.c9.utils.Helpers;

	[Bindable]
	public class CloudFormationStackResourceRepresenter extends RepresenterBase
	{
		public function CloudFormationStackResourceRepresenter(data:Object)
		{
			super(data);
		}
		
		public function get description():String 
		{
			return data.Description;
		}
		
		public function get logicalResourceId():String 
		{
			return data.LogicalResourceId;
		}
		
		public function get physicalResourceId():String 
		{
			return data.PhysicalResourceId;
		}
		
		public function get resourceStatus():String 
		{
			return data.ResourceStatus;
		}
		
		public function get resourceType():String 
		{
			return data.ResourceType;
		}
		
		public function get stackId():String 
		{
			return data.StackId;
		}
		
		public function get stackName():String 
		{
			return data.StackName;
		}
		
		public function get timestamp():String 
		{
			var dateString:String = data.Timestamp;
			return dateFormatter.format(Helpers.formatDate(dateString));
		}
	}
}