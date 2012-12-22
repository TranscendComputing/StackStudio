package com.momentumsi.c9.models
{
	import com.momentumsi.c9.constants.PermissionType;
	
	import mx.collections.ArrayCollection;
	
	[Bindable]
	public class GroupProject
	{		
		public var id:String;
		public var group:Group;
		public var permissions:ArrayCollection;
		
		public function GroupProject()
		{
			
		}
		
		public static function buildGroupProject(groupProject:Object):GroupProject
		{
			var gp:GroupProject = new GroupProject();
			gp.id = groupProject["id"];
			gp.group = Group.buildGroup(groupProject["group"]["group"]);
			
			var perm:Permission;
			var groupPermissions:Array = groupProject["permissions"];
			var permissions:ArrayCollection = new ArrayCollection();
			if(groupPermissions != null)
			{
				for(var index:int = 0; index < groupPermissions.length; index ++)
				{
					perm = new Permission();
					perm.id = groupProject["permissions"][index]["permission"]["id"];	
					perm.name = groupProject["permissions"][index]["permission"]["name"];
					perm.environment = groupProject["permissions"][index]["permission"]["environment"];
					permissions.addItem(perm);
				}
				
			}
			gp.permissions = permissions;
			
			return gp;
		}
		
		public function get name():String
		{
			return group.name;
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
		
		
		//Determines if this group has any type of access to the environment
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