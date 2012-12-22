package com.momentumsi.c9.representers
{
	import mx.collections.ArrayCollection;
	[Bindable]
	public class NotificationTopicRepresenter extends RepresenterBase
	{
		public var subscriptionsCollection:ArrayCollection;
		public function NotificationTopicRepresenter(data:Object)
		{
			super(data);
			subscriptionsCollection = new ArrayCollection(data.Subscriptions as Array);
		}
		
		public function get name():String
		{
			return data.TopicName;
		}
		
		public function get effectiveDeliveryPolicy():String
		{
			return data.EffectiveDeliveryPolicy;
		}
		
		public function get owner():String
		{
			return data.Owner;
		}
		
		public function get subscriptionsPending():String
		{
			return data.SubscriptionsPending;
		}
		
		public function get policy():String
		{
			return data.Policy;
		}
		
		public function get subscriptionsConfirmed():String
		{
			return data.SubscriptionsConfirmed;
		}
		
		public function get subscriptionsDeleted():String
		{
			return data.SubscriptionsDeleted;
		}
		
		public function get topicArn():String
		{
			return data.TopicArn;
		}
	}
}