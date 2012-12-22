package com.momentumsi.c9.models
{
	import flash.events.Event;
	import flash.events.EventDispatcher;
	
	import mx.collections.ArrayCollection;
	import mx.rpc.events.ResultEvent;
	
	[Bindable]
	public class Org extends EventDispatcher
	{		
		//API Identity
		public var id:String;
		public var name:String;
		public var accounts:ArrayCollection;
		public var subscriptions:ArrayCollection;
		public var cloud_mappings:ArrayCollection;
		
		public function Org(id:String=null, name:String=null, accounts:ArrayCollection=null, subscriptions:ArrayCollection=null, cloud_mappings:ArrayCollection=null)
		{
			this.id = id;
			this.name = name;
			this.accounts = accounts;
			this.subscriptions = subscriptions;
			this.cloud_mappings = cloud_mappings;
		}
		
		public static function buildOrg(result:Object):Org
		{
			var tmpColl:ArrayCollection;
			var item:Object;
			
			var newAccounts:ArrayCollection = new ArrayCollection();
			tmpColl = new ArrayCollection(result.accounts as Array);
			for each(item in tmpColl)
			{
				newAccounts.addItem(User.buildUser(item.account));
			}
			
			var newMappings:ArrayCollection = new ArrayCollection();
			tmpColl = new ArrayCollection(result.cloud_mappings as Array);
			for each(item in tmpColl)
			{
				newMappings.addItem(CloudMapping.buildCloudMapping(item.cloud_mapping));
			}
			
			var newSubscriptions:ArrayCollection = new ArrayCollection(result.subscriptions as Array);
			
			var newOrg:Org = new Org(result.id, result.name, newAccounts, newSubscriptions, newMappings);
			
			return newOrg;
		}
		
		public function toObject():Object
		{
			return {org: {name: name, accounts: accounts, subscriptions: subscriptions, cloud_mappings: cloud_mappings}};
		}

	}
}