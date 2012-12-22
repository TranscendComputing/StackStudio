package com.momentumsi.c9.representers
{
	import mx.collections.ArrayCollection;

	[Bindable]
	public class ComputeSecGrpRulesRepresenter extends RepresenterBase
	{
		private var index:int;
		public function ComputeSecGrpRulesRepresenter(data:Object, index:int=0)
		{
			super(data);
			this.index = index;
		}
		
		public function get fromPort():String 
		{
			return data.fromPort || data.from_port;
		}
		
		public function get toPort():String 
		{
			return data.toPort || data.to_port;
		}
		
		public function get ipProtocol():String 
		{
			return data.ipProtocol || data.ip_protocol;
		}
		
		public function get cidrIp():String 
		{
			var ipRange:Object;
			if(data.ipRanges)
			{
				ipRange = data.ipRanges[index];
			}else{
				ipRange = data.ip_range;
			}
			
			if(ipRange == null)
			{
				return null;
			}else{
				return ipRange.cidr || ipRange.cidrIp;
			}
		}
		
		public function get group():Object
		{
			var groupObj:Object;
			if(data.groups)
			{
				groupObj = data.groups[index];
			}else{
				groupObj = data.group;
			}
			
			if(groupObj == null)
			{
				return null;
			}
			
			var newObj:Object = new Object();
			newObj.ownerId = groupObj.ownerId || groupObj.userId || groupObj.tenant_id;
			newObj.name = groupObj.groupName || groupObj.name;
			newObj.id = groupObj.groupId || groupObj.group_id|| groupObj.id;
				
			return newObj;
		}
		
		public function get port():String
		{
			if(fromPort == toPort)
			{
				return fromPort;
			}else{
				return fromPort + "-" + toPort;
			}
		}
		
		public function get source():String
		{
			if(cidrIp != null)
			{
				return cidrIp;
			}else
			{
				return group.ownerId + "/" + group.name;
			}
		}
		
		public function get id():String
		{
			if(data.id)
			{
				return data.id;
			}else{
				return null;
			}
		}
		
		public function equals(otherRule:ComputeSecGrpRulesRepresenter):Boolean
		{
			if(otherRule.ipProtocol == this.ipProtocol &&
				otherRule.fromPort == this.fromPort &&
				otherRule.toPort == this.toPort &&
				otherRule.cidrIp == this.cidrIp && 
				otherRule.group.ownerId == this.group.id && 
				otherRule.group.name == this.group.name){
				return true;
			}else{
				return false;
			}
		}
		
		public function toObject():Object
		{
			var returnObj:Object = new Object();
			returnObj.IpProtocol = ipProtocol;
			returnObj.FromPort = fromPort;
			returnObj.ToPrt = toPort;
			if(cidrIp != null)
			{
				returnObj.CidrIp = cidrIp;
			}
			
			if(group!= null)
			{
				if(group.id != null)
				{
					returnObj.SourceSecurityGroupId = group.id;				
				}
				if(group.name != null)
				{				
					returnObj.SourceSecurityGroupName = group.name;
				}
				if(group.ownerId != null)
				{
					returnObj.SourceSecurityGroupOwnderId = group.ownerId;
				}
			}
			
			return returnObj;
		}
	}
}