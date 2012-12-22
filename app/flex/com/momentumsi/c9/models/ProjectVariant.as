package com.momentumsi.c9.models
{
	import flash.events.EventDispatcher;
	import flash.events.IEventDispatcher;
	
	import mx.collections.ArrayCollection;
	
	[Bindable]
	public class ProjectVariant extends EventDispatcher
	{
		public static const ADD_TYPE:String = "add";
		public static const REMOVE_TYPE:String = "remove";
		public static const MODIFY_TYPE:String = "modify";
		
		public var environment:String;
		public var ruleType:String;
		public var rules:Object;
		
		public function ProjectVariant(target:IEventDispatcher=null)
		{
			super(target);
		}
		
		public static function buildVariant(variant:Object):ProjectVariant
		{
			var pVariant:ProjectVariant = new ProjectVariant();
			pVariant.environment = variant["environment"];
			pVariant.ruleType = variant["rule_type"];
			pVariant.rules = variant["rules"];
			return pVariant;
		}
		
		public function toObject():Object
		{
			return {variant: {environment: environment, rule_type: ruleType, rules: rules}};
		}
	}
}