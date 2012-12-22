package com.momentumsi.c9.models
{
	public class Subscription
	{
		public var orgId:String;
		public var orgName:String;
		public var product:String;
		public var billingLevel:String;
		public var role:String;
		
		public function Subscription(orgId:String=null, orgName:String=null, product:String=null, billingLevel:String=null, role:String=null)
		{
			this.orgId = orgId;
			this.orgName = orgName;
			this.product = product;
			this.billingLevel = billingLevel;
			this.role = role;
		}
		
		public static function buildSubscription(subscription:Object):Subscription
		{
			var s:Subscription;
			
			s = new Subscription(subscription["org_id"], subscription["org_name"], subscription["product"], subscription["billing_level"], subscription["role"]);
			
			return s;
		}
	}
}