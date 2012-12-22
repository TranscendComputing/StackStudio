package com.momentumsi.c9.models.resources
{
	import com.momentumsi.c9.constants.ResourceType;
	import com.momentumsi.c9.models.Element;
	import com.momentumsi.c9.models.ResourceElement;
	import com.momentumsi.c9.representers.ComputeSecGrpRulesRepresenter;
	
	import mx.collections.ArrayCollection;
	
	[Bindable]
	public class Ec2SecurityGroup extends ResourceElement
	{
		public var groupDescription:String;
		public var vpcId:Object;
		private var _securityGroupIngress:ArrayCollection = new ArrayCollection();
		private var _securityGroupEgress:ArrayCollection = new ArrayCollection();
		
		public function Ec2SecurityGroup(element:Element = null)
		{
			super(element);
			elementType = ResourceType.EC2_SECURITY_GROUP;
			groupDescription = _resourceProperties.GroupDescription;
			
			var item:Object;
			var holderColl:ArrayCollection;
			holderColl = new ArrayCollection(_resourceProperties.SecurityGroupIngress as Array);
			for each(item in holderColl)
			{
				_securityGroupIngress.addItem(new Ec2SecurityGroupRule(item));
			}
			holderColl = new ArrayCollection(_resourceProperties.SecurityGroupEgress as Array);
			for each(item in holderColl)
			{
				_securityGroupEgress.addItem(new Ec2SecurityGroupRule(item));
			}
		}
		
		public function get securityGroupIngress():ArrayCollection 
		{
			return _securityGroupIngress;
		}
		
		public function set securityGroupIngress(value:ArrayCollection):void 
		{
			_securityGroupIngress = value;
		}
		
		override public function get attributes():Object
		{
			var props:Object = new Object();
			
			if(_securityGroupIngress.length > 0)
			{
				var ingress:Array = [];
				 for each(var rule:ComputeSecGrpRulesRepresenter in _securityGroupIngress)
				 {
					 ingress.push(rule.toObject());
				 }
				 props.SecurityGroupIngress = ingress;
			}
			if(_securityGroupEgress.length > 0)
			{
				props.SecurityGroupEgress = _securityGroupEgress;
			}
			if(vpcId != null)
			{
				props.VpcId = vpcId;
			}
			props.GroupDescription = groupDescription;
			
			return props;
		}
	}
}