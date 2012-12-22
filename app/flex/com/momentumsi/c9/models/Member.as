package com.momentumsi.c9.models
{
	import com.momentumsi.c9.constants.PermissionType;
	
	import mx.collections.ArrayCollection;

	[Bindable]
	public class Member
	{		
		public var id:String;
		public var role:String;
		public var account:User;
		public var permissions:ArrayCollection;
		
		public function Member()
		{
			
		}
		
		public static function buildMember(member:Object):Member
		{
			var m:Member = new Member();
			m.id = member["id"];
			m.role = member["role"];
			m.account = User.buildUser(member["account"]);
			
			var perm:Permission;
			var memberPermissions:Array = member["permissions"];
			var permissions:ArrayCollection = new ArrayCollection();
			if(memberPermissions != null)
			{
				for(var index:int = 0; index < memberPermissions.length; index ++)
				{
					perm = new Permission();
					perm.id = member["permissions"][index]["permission"]["id"];	
					perm.name = member["permissions"][index]["permission"]["name"];
					perm.environment = member["permissions"][index]["permission"]["environment"];
					permissions.addItem(perm);
				}
				
			}
			m.permissions = permissions;
			
			return m;
		}
		
		public function get name():String
		{
			return account.login;
		}
		
		public function toObject():Object
		{
			return {member: {account_id: account.id, role: role}};
		}

		public function hasPermission(name:String, environment:String):Boolean
		{
			var found:Boolean = false;
			if(permissions != null)
			{
				for each(var p:Permission in permissions)
				{
					if(p.name == name && p.environment == environment)
					{
						found = true;
					}
				}
			}
			return found;
		}
		
		//Determines if this member has any type of access to the environment
		public function hasEnvironmentAccess(environment:String):Boolean
		{
			if(permissions != null)
			{
				for each(var p:Permission in permissions)
				{
					if(p.environment == environment)
					{
						return true;
					}
				}
			}
			
			//Environment access not found, return false
			return false;
		}
		
		public function isProjectAdmin():Boolean
		{
			if(hasPermission(PermissionType.EDIT_SOURCE, PermissionType.DEVELOPMENT) && hasPermission(PermissionType.CREATE_STACK, PermissionType.DEVELOPMENT) &&
				hasPermission(PermissionType.EDIT_SOURCE, PermissionType.TEST) && hasPermission(PermissionType.CREATE_STACK, PermissionType.TEST) &&
				hasPermission(PermissionType.EDIT_SOURCE, PermissionType.STAGE) && hasPermission(PermissionType.CREATE_STACK, PermissionType.STAGE) &&
				hasPermission(PermissionType.EDIT_SOURCE, PermissionType.PRODUCTION) && hasPermission(PermissionType.CREATE_STACK, PermissionType.PRODUCTION))
			{
				return true;
			}else
			{
				return false;
			}
		}
	}
}