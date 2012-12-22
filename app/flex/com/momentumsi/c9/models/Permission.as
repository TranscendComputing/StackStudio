package com.momentumsi.c9.models
{
	import com.momentumsi.c9.services.IdentityService;
	
	import flash.events.Event;
	import flash.events.EventDispatcher;
	
	import mx.rpc.events.ResultEvent;

	[Bindable]
	public class Permission extends EventDispatcher
	{
		//API Identity
		public var id:String;
		
		public var name:String;
		public var environment:String;
		
		private var identityService:IdentityService;
		
		public function Permission(id:String=null, name:String=null, environment:String=null)
		{
			this.id = id;
			this.name = name;
			this.environment = environment;
		}

		public function toObject():Object
		{
			return {permission: {name: name, environment: environment}};
		}
	}
}