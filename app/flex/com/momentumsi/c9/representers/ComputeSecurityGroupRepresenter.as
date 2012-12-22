package com.momentumsi.c9.representers
{
	import mx.collections.ArrayCollection;

	[Bindable]
	public class ComputeSecurityGroupRepresenter extends RepresenterBase
	{
		private static const UNAVAILABLE:String = "Unavailable";
		public var ipPermissions:ArrayCollection = new ArrayCollection();
		public function ComputeSecurityGroupRepresenter(data:Object)
		{
			if(data != null)
			{
				super(data);
				var permissions:ArrayCollection;
				var item:Object;
				if(data.ip_permissions != null)
				{
					permissions = new ArrayCollection(data.ip_permissions as Array);
					for each(item in permissions)
					{
						ipPermissions.addItem(new ComputeSecGrpRulesRepresenter(item));
					}
				}else if(data.rules != null)
				{
					permissions = new ArrayCollection(data.rules as Array);
					for each(item in permissions)
					{
						ipPermissions.addItem(new ComputeSecGrpRulesRepresenter(item));
					}
				}
			}
		}
		
		public function get name():String 
		{
			return data.name;
		}
		
		public function get id():String
		{
			if(data.id == null)
			{
				return data.name;
			}else{
				return data.id;
			}
		}
		
		public function get description():String 
		{
			return data.description;
		}
		
		public function get groupId():String 
		{
			if(data.group_id != null)
			{
				return data.group_id;
			}else if(data.id != null){
				return data.id;
			}else{
				return UNAVAILABLE;
			}
		}
		
		public function get ownerId():String 
		{
			if(data.owner_id != null)
			{
				return data.owner_id;
			}else{
				return data.tenant_id;
			}
		}
		
		public function get vpcId():String 
		{
			return data.vpc_id;
		}
	}
}