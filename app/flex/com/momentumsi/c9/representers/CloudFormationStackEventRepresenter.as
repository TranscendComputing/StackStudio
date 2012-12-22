package com.momentumsi.c9.representers
{
	import com.maccherone.json.JSON;
	import com.momentumsi.c9.utils.Helpers;

	[Bindable]
	public class CloudFormationStackEventRepresenter extends RepresenterBase
	{
		public static const CREATE_IN_PROGRESS:String = "CREATE_IN_PROGRESS";
		public static const CREATE_COMPLETE:String = "CREATE_COMPLETE";
		public static const CREATE_FAILED:String = "CREATE_FAILED";
		public static const DELETE_IN_PROGRESS:String = "DELETE_IN_PROGRESS"; 
		public static const DELETE_COMPLETE:String = "DELETE_COMPLETE";
		public static const DELETE_FAILED:String = "DELETE_FAILED";
		public static const ROLLBACK_COMPLETE:String = "ROLLBACK_COMPLETE";
		public static const ROLLBACK_IN_PROGRESS:String = "ROLLBACK_IN_PROGRESS";
		public static const ROLLBACK_FAILED:String = "ROLLBACK_FAILED";
		
		public function CloudFormationStackEventRepresenter(data:Object)
		{
			super(data);
		}
		
		public function get timestamp():Date 
		{
			var dateString:String = data.Timestamp;
			return Helpers.formatDate(dateString);
			//return dateFormatter.format(Helpers.formatDate(dateString));
		}
		
		public function get resourceStatus():String 
		{
			return data.ResourceStatus;
		}
		
		public function get resourceStatusReason():String 
		{
			if(data.hasOwnProperty("ResourceStatusReason"))
			{
				return data.ResourceStatusReason;
			}else{
				return null;
			}
		}
		
		public function get stackId():String 
		{
			return data.StackId;
		}
		
		public function get eventId():String 
		{
			return data.EventId;
		}
		
		public function get logicalResourceId():String 
		{
			return data.LogicalResourceId;
		}
		
		public function get stackName():String 
		{
			return data.StackName;
		}
		
		public function get physicalResourceId():String 
		{
			return data.PhysicalResourceId;
		}
		
		public function get resourceProperties():Object 
		{
			if(data.hasOwnProperty("ResourceProperties"))
			{
				return JSON.decode(data.ResourceProperties);
			}else{
				return null;
			}
		}
		
		public function get resourceType():String 
		{
			return data.ResourceType;
		}
		
		public function get displayString():String 
		{
			var reason:String;
			if(resourceStatusReason != null)
			{
				reason = "\n" + resourceStatusReason;
			}else{
				reason = "";
			}
			return logicalResourceId + ":" + resourceStatus + reason + "\n" + timestamp;
		}
	}
}