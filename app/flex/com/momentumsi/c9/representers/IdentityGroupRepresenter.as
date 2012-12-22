package com.momentumsi.c9.representers
{
	import mx.collections.ArrayCollection;

	[Bindable]
	public class IdentityGroupRepresenter extends RepresenterBase
	{
		public var groupUsers:ArrayCollection;
		public function IdentityGroupRepresenter(data:Object)
		{
			super(data);
			var tmpCollection:ArrayCollection = new ArrayCollection(data.users as Array);
			for each(var user:Object in tmpCollection)
			{
				tmpCollection.setItemAt(new IdentityUserRepresenter(user), tmpCollection.getItemIndex(user));
			}
			groupUsers = new ArrayCollection(tmpCollection.source);
		}
		
		public function get arn():String
		{
			return data.Arn;
		}
		
		public function get name():String
		{
			if(data.GroupName)
			{
				return data.GroupName;
			}else{
				return data.name;
			}
		}
		
		public function get description():String
		{
			return data.description;
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
		
		public function get groupId():String
		{
			if(data.GroupId)
			{
				return data.GroupId;
			}else{
				return data.id;
			}
		}
		
		public function get path():String
		{
			return data.Path;
		}
	}
}