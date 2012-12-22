package com.momentumsi.c9.models
{
	import mx.collections.ArrayCollection;
	
	[Bindable]
	public class Group
	{		
		public var id:String;
		public var org_id:String;
		public var name:String;
		public var description:String;
		public var group_memberships:ArrayCollection;
		
		public function Group()
		{
			
		}
		
		public function toObject():Object
		{
			return {group: {name: name, description: description}};
		}
		
		public static function buildGroup(group:Object):Group
		{
			var g:Group = new Group();
			g.id = group["id"];
			g.org_id = group["org_id"];
			g.name = group["name"];
			g.description = group["description"];
			
			g.group_memberships = new ArrayCollection(group["group_memberships"]);
			
			return g;
		}
		
		public function hasUser(userId:String):Boolean
		{
			var found:Boolean = false;
			for each(var member:Object in group_memberships)
			{
				if(!found && member.hasOwnProperty("group_membership") && member.group_membership.hasOwnProperty("account"))
				{
					member = member.group_membership.account;
					if(member.id == userId)
					{
						found = true;
					}
				}
			}
			return found;
		}
	}
}