package com.momentumsi.c9.models.resources
{
	[Bindable]
	public class DbSecurityGroupRule
	{
		public var cidrip:String;
		private var _ec2SecurityGroupId:Object = new Object();
		private var _ec2SecurityGroupName:Object = new Object();
		private var _ec2SecurityGroupOwnerId:Object = new Object();
		
		public function DbSecurityGroupRule(data:Object)
		{
			if(data != null)
			{
				cidrip = data.CIDRIP;
				_ec2SecurityGroupId = data.EC2SecurtyGroupId;
				_ec2SecurityGroupName = data.EC2SecurityGroupName;
				_ec2SecurityGroupOwnerId = data.EC2SecurityGroupOwnerId;
			}
		}
		
		public function get ec2SecurityGroupId():Object 
		{
			return _ec2SecurityGroupId;
		}
		
		public function set ec2SecurityGroupId(value:Object):void 
		{
			_ec2SecurityGroupId = value;
		}
		
		public function get ec2SecurityGroupName():Object 
		{
			return _ec2SecurityGroupName;
		}
		
		public function set ec2SecurityGroupName(value:Object):void 
		{
			_ec2SecurityGroupName = value;
		}
		
		public function get ec2SecurityGroupOwnerId():Object 
		{
			return _ec2SecurityGroupOwnerId;
		}
		
		public function set ec2SecurityGroupOwnerId(value:Object):void 
		{
			_ec2SecurityGroupOwnerId = value;
		}
		
		public function toObject():Object
		{
			var returnObj:Object = new Object();
			if(cidrip != null)
			{
				returnObj.CIDRIP
			}
			if(_ec2SecurityGroupId != null)
			{
				returnObj.EC2SecurityGroupId = _ec2SecurityGroupId;
			}
			if(_ec2SecurityGroupName != null)
			{
				returnObj.EC2SecurityGroupName = _ec2SecurityGroupName;
			}
			if(_ec2SecurityGroupOwnerId != null)
			{
				returnObj.EC2SecurityGroupOwnerId = _ec2SecurityGroupOwnerId;
			}
			return returnObj;
		}
	}
}