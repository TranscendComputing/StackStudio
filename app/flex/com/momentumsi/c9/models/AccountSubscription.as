package com.momentumsi.c9.models
{
	public class AccountSubscription
	{
		[Bindable]
		public var billingLevel:String;
		public var orgId:String;
		[Bindable]
		public var orgName:String;
		public var product:String;
		public var role:String;
		public var subscribers:Array = [];
		public var allocatedSeats:int = 0;
		
		public function AccountSubscription(subscription:Object)
		{
			this.billingLevel = subscription["billing_level"];
			this.orgId = subscription["org_id"];
			this.orgName = subscription["org_name"];
			this.product = subscription["product"];
			this.role = subscription["role"];
		}
	}
}