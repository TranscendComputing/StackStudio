package com.momentumsi.c9.models.resources
{
	import com.momentumsi.c9.constants.ResourceType;
	import com.momentumsi.c9.models.Element;
	import com.momentumsi.c9.models.ResourceElement;
	import com.momentumsi.c9.representers.ComputeSecurityGroupRepresenter;
	
	import mx.collections.ArrayCollection;
	
	[Bindable]
	public class DbSecurityGroup extends ResourceElement
	{
		public var groupDescription:String;
		public var sourceGroup:Object;
		private var _ec2VpcId:Object;
		private var _dbSecurityGroupIngress:ArrayCollection = new ArrayCollection();
	
		public function DbSecurityGroup(element:Element=null)
		{
			super(element);	
			elementType = ResourceType.DB_SECURITY_GROUP;
			groupDescription = _resourceProperties.GroupDescription;
			_ec2VpcId = _resourceProperties.EC2VpcId;
			var ingressColl:ArrayCollection = new ArrayCollection(_resourceProperties.DBSecurityGroupIngress as Array);
			for each(var ingress:Object in ingressColl)
			{
				_dbSecurityGroupIngress.addItem(new DbSecurityGroupRule(ingress));
			}
		}
		
		public function get dbSecurityGroupIngress():ArrayCollection 
		{
			return _dbSecurityGroupIngress;
		}
		
		override public function get attributes():Object
		{
			var props:Object = new Object();
			if(_ec2VpcId != null)
			{
				props.EC2VpcId = _ec2VpcId;
			}
			if(_dbSecurityGroupIngress.length > 0)
			{
				var ingress:Array = [];
				var ruleObj:Object;
				for each(var rule:DbSecurityGroupRule in _dbSecurityGroupIngress)
				{
					ruleObj = rule.toObject();
					ingress.push(ruleObj);
				}
				props.DBSecurityGroupIngress = ingress;
			}else if(sourceGroup != null){
				props.DBSecurityGroupIngress = {
					EC2SecurityGroupName: sourceGroup
				}
			}
				
			
			props.GroupDescription = groupDescription;

			return props;
		}
	}
}