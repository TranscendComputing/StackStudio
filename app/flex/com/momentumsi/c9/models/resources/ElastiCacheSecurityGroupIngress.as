package com.momentumsi.c9.models.resources
{
	import com.momentumsi.c9.models.Element;
	
	public class ElastiCacheSecurityGroupIngress extends Element
	{
		[Bindable]
		public var cacheSecurityGroupName:String
		[Bindable]
		public var ec2SecurityGroupName:Object;
		[Bindable]
		public var ec2SecurityGroupOwnerId:Object;
		
		public function ElastiCacheSecurityGroupIngress(id:String=null, name:String=null, elementType:String=null)
		{
			super(id, name, elementType);
			elementGroup = ELEMENT_GROUP_RESOURCE;
			elementType = "AWS::ElastiCacheSecurityGroupIngress";			
		}
		
		override public function get properties():Object
		{
			properties = new Object();
			if(ec2SecurityGroupOwnerId != null)
			{
				properties["EC2SecurityGroupOwnerId"] = ec2SecurityGroupOwnerId;
			}
			properties["CacheSecurityGroupName"] = cacheSecurityGroupName;
			properties["EC2SecurityGroupName"] = ec2SecurityGroupName;
			return properties;			
		}
	}
}