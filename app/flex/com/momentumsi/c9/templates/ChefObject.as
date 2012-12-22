package com.momentumsi.c9.templates
{
	import com.momentumsi.c9.constants.ResourceType;
	import com.momentumsi.c9.models.Element;
	
	import mx.collections.ArrayCollection;

	public class ChefObject extends InstallObject
	{
		protected var _chefServer:Object = {Ref: "ChefServerUrl"};
		
		public function ChefObject(roles:Array, chefServerUrl:Object=null, chefConfigBucket:Object=null)
		{
			if(chefServerUrl != null)
			{
				_chefServer = chefServerUrl
			}
			super(ResourceType.CHEF_ROLE, roles, chefServerUrl, chefConfigBucket);
		}
		
		protected function get runList():Array
		{
			var _runList:Array = [];
			var rolesCollection:ArrayCollection = new ArrayCollection(roles);
			for each(var role:String in rolesCollection)
			{
				_runList.push("role[" + role + "]");
			}
			return _runList;
		}
	}
}