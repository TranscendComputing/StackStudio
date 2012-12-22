package com.momentumsi.c9.models
{
	[Bindable]
	public class Environment
	{
		public static const DEVELOPMENT:String = "development";
		public static const TEST:String = "test";
		public static const STAGING:String = "stage";
		public static const PRODUCTION:String = "production";
		
		public var name:String;
		public var id:String;
		public function Environment(name:String=null)
		{
			this.name = name;
		}
		
		public static function buildEnvironment(env:Object):Environment
		{
			var environment:Environment = new Environment();
			environment.name = env["name"];
			environment.id = env["id"];
			return environment;
		}
		
		public function toString():String
		{
			return name;
		}
		
		public function toObject():Object
		{
			return {environment: {name: name}};
		}
	}
}