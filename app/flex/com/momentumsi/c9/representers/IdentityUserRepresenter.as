package com.momentumsi.c9.representers
{
	import mx.collections.ArrayCollection;

	[Bindable]
	public class IdentityUserRepresenter extends RepresenterBase
	{
		public var userGroups:ArrayCollection;
		public function IdentityUserRepresenter(data:Object)
		{
			super(data);
			var tmpCollection:ArrayCollection = new ArrayCollection(data.groups as Array);
			for each(var group:Object in tmpCollection)
			{
				tmpCollection.setItemAt(new IdentityGroupRepresenter(group), tmpCollection.getItemIndex(group));
			}
			userGroups = new ArrayCollection(tmpCollection.source);
		}
		
		public function get arn():String
		{
			if(data.arn)
			{
				return data.arn;
			}else{
				return data.Arn;
			}
		}
		
		public function get name():String
		{
			if(data.name)
			{
				return data.name;
			}else if(data.UserName){
				return data.UserName;
			}else{
				return data.id;
			}
		}
		
		public function get path():String
		{
			if(data.path)
			{
				return data.path;
			}else{
				return data.Path;
			}
		}
		
		public function get userId():String
		{
			if(data.user_id)
			{
				return data.user_id;
			}else if (data.UserId){
				return data.UserId;
			}else{
				return data.id;
			}
		}
		
		public function get groupId():String
		{
			return data.tenantId;
		}
		
		public function email():String
		{
			return data.email;
		}
		
		public function enabled():Boolean
		{
			if(data.enabled != null)
			{
				return data.enabled
			}else{
				return true;
			}
		} 
	}
}