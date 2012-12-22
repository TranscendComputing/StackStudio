package com.momentumsi.c9.representers
{
	import mx.collections.ArrayCollection;

	[Bindable]
	public class DbSecurityGroupRepresenter extends RepresenterBase
	{
		public function DbSecurityGroupRepresenter(data:Object)
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
		
		private function get computeSecurityGroups():ArrayCollection 
		{
			var secGrps:ArrayCollection = new ArrayCollection();
			var tmpColl:ArrayCollection = new ArrayCollection(data.ec2_security_groups as Array);
			for each(var item:Object in tmpColl)
			{
				secGrps.addItem({type: "Compute Security Group", value: item.EC2SecurityGroupName, owner: item.EC2SecurityGroupOwnerId, status: item.Status});
			}
			return secGrps; 
		}
		
		private function get ipRanges():ArrayCollection
		{
			var cidrIps:ArrayCollection = new ArrayCollection();
			var tmpColl:ArrayCollection = new ArrayCollection(data.ip_ranges as Array);
			for each(var item:Object in tmpColl)
			{
				cidrIps.addItem({type: "CIDR/IP", value: item.CIDRIP, status: item.Status});
			}
			return cidrIps; 
		}
		
		public function get ownerId():String
		{
			return data.owner_id;
		}
		
		public function get sources():ArrayCollection
		{
			var combinedColl:ArrayCollection = new ArrayCollection();
			combinedColl.addAll(computeSecurityGroups);
			combinedColl.addAll(ipRanges);
			return combinedColl;
		}
		
	}
}