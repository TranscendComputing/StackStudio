package com.momentumsi.c9.constants
{
	import com.momentumsi.c9.models.Permission;
	
	import mx.collections.ArrayCollection;

	public final class PermissionType
	{
		//Environments
		public static const DEVELOPMENT:String = "development";
		public static const TEST:String = "test";
		public static const STAGE:String = "stage";
		public static const PRODUCTION:String = "production";
		public static const TRANSCEND:String = "transcend";
		
		//Permission Names
		public static const ADMIN:String = "admin";
		public static const VIEW_SOURCE:String = "view_source";
		public static const EDIT_SOURCE:String = "edit_source";
		public static const PUBLISH_SOURCE:String = "publish_source";
		public static const PROMOTE_ENVIRONMENT:String = "promote_environment";
		public static const CREATE_STACK:String = "create_stack";
		public static const UPDATE_STACK:String = "update_stack";
		public static const DELETE_STACK:String = "delete_stack";
		public static const MONITOR:String = "monitor";
		
		//Permission Role Names
		public static const NONE_ROLE:String = "None";
		public static const AUTHOR_ROLE:String = "Author";
		public static const PROVISION_ROLE:String = "Provision";
		public static const MONITOR_ROLE:String = "Monitor";
		public static const FULL_ROLE:String = "Full";
		
		//Permission Role Arrays
		public static const NONE_ARRAY:Array = new Array();
		public static const AUTHOR_ARRAY:Array = new Array("view_source", "edit_source", "publish_source");
		public static const PROVISION_ARRAY:Array = new Array("create_stack", "update_stack", "delete_stack");
		public static const MONITOR_ARRAY:Array = new Array("monitor");
		public static const FULL_ARRAY:Array = new Array("view_source", "edit_source", "publish_source", "promote_environment", "create_stack", "update_stack", "delete_stack", "monitor");
	}
}