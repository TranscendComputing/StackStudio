package com.momentumsi.c9.models
{
	import mx.collections.ArrayCollection;

	public class Account
	{
		public var id:String;
		public var login:String;
		public var email:String;
		[Bindable]
		public var subscription:AccountSubscription;
		
		public function Account(account:Object)			
		{
			this.id = account["id"];
			this.login = account["login"];
			this.email = account["email"];
		}
	}
}