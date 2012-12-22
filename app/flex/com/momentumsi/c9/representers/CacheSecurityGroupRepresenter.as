package com.momentumsi.c9.representers
{
	import mx.collections.ArrayCollection;

	[Bindable]
	public class CacheSecurityGroupRepresenter extends RepresenterBase
	{
		public function CacheSecurityGroupRepresenter(data:Object)
		{
			super(data);
		}
		
		public function get id():String 
		{
			return data.id;
		}
		
		public function get description():String 
		{
			return data.description;
		}
		
		public function get computeSecurityGroups():ArrayCollection 
		{
			var secGrps:ArrayCollection = new ArrayCollection();
			var tmpColl:ArrayCollection = new ArrayCollection(data.ec2_groups as Array);
			for each(var item:Object in tmpColl)
			{
				secGrps.addItem({type: "Compute Security Group", value: item.EC2SecurityGroupName, owner: item.EC2SecurityGroupOwnerId, status: item.Status});
			}
			return secGrps; 
		}
		
		public function get ownerId():String 
		{
			return data.owner_id;
		}
	}
}