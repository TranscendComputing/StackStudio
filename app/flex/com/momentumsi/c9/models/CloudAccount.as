package com.momentumsi.c9.models
{
	import mx.collections.ArrayCollection;
	import mx.core.BitmapAsset;

	[Bindable]
	public class CloudAccount
	{
		public var id:String;
		public var cloud_id:String;
		public var cloud_name:String;
		public var cloud_provider:String = AMAZON;
		public var name:String = "New Account";
		public var description:String;
		public var access_key:String;
		public var secret_key:String;
		public var auditLogs:ArrayCollection = new ArrayCollection();
		public var cloudAttributes:Object;
		public var stackPreferences:Object;
		public var topstackEnabled:Boolean;
		public var chefRoles:ArrayCollection = new ArrayCollection();
		public var puppetModules:ArrayCollection = new ArrayCollection();
		[Embed(source='/com/momentumsi/c9/assets/CloudLogos/amazon.png')]
		private var amazonIcon:Class;
		[Embed(source='/com/momentumsi/c9/assets/CloudLogos/eucalyptus.png')]
		private var eucalyptusIcon:Class;
		[Embed(source='/com/momentumsi/c9/assets/CloudLogos/openstack.png')]
		private var openstackIcon:Class;
		
		
		[Embed(source="/com/momentumsi/c9/assets/CloudLogos/amazon800.jpg")]
		private var amazonCoverFlow:Class;
		[Embed(source="/com/momentumsi/c9/assets/CloudLogos/eucalyptus300.jpg")]
		private var eucalyptusCoverFlow:Class;
		[Embed(source="/com/momentumsi/c9/assets/CloudLogos/openstack300.jpg")]
		private var openstackCoverFlow:Class;
		[Embed(source="/com/momentumsi/c9/assets/CloudLogos/azure600x450.jpg")]
		private var azureCoverFlow:Class;
		[Embed(source="/com/momentumsi/c9/assets/CloudLogos/cloudstack160x38.jpg")]
		private var cloudstackCoverFlow:Class;
		[Embed(source="/com/momentumsi/c9/assets/CloudLogos/joyent200.jpg")]
		private var joyentCoverFlow:Class;
		[Embed(source="/com/momentumsi/c9/assets/CloudLogos/piston345x146.jpg")]
		private var pistonCoverFlow:Class;
		[Embed(source="/com/momentumsi/c9/assets/CloudLogos/rackspace400.jpg")]
		private var rackspaceCoverFlow:Class;
		[Embed(source="/com/momentumsi/c9/assets/CloudLogos/hp240x120.jpg")]
		private var hpCoverFlow:Class;
		
		public static const AMAZON:String = "AWS";
		public static const OPENSTACK:String = "OpenStack";
		public static const ESSEX_OPENSTACK:String = "OpenStack Essex";
		public static const EUCALYPTUS:String = "Eucalyptus";
		public static const CLOUDSTACK:String = "CloudStack";
		public static const PISTON:String = "Piston";
		public static const HP:String = "HP";
		public static const JOYENT:String = "Joyent";
		public static const AZURE:String = "Azure";
		public static const RACKSPACE:String = "Rackspace";
		
		public function CloudAccount()
		{
			
		}
		
		public static function buildCloudAccount(cloudAccount:Object):CloudAccount
		{
			var acct:CloudAccount;
			
			acct = new CloudAccount();
			acct.name = cloudAccount["name"];
			acct.cloud_name = cloudAccount["cloud_name"];
			acct.description = cloudAccount["description"];
			acct.cloud_id = cloudAccount["cloud_id"];
			acct.access_key = cloudAccount["access_key"];
			acct.secret_key = cloudAccount["secret_key"];
			acct.id = cloudAccount["id"];
			acct.cloud_provider = cloudAccount["cloud_provider"];
			acct.cloudAttributes = cloudAccount["cloud_attributes"];
			acct.topstackEnabled = Boolean(cloudAccount["topstack_enabled"]);
			if(cloudAccount["stack_preferences"] == null)
			{
				acct.stackPreferences = new Object();
			}else
			{
				acct.stackPreferences = cloudAccount["stack_preferences"];
			}
			
			var logs:ArrayCollection = new ArrayCollection(cloudAccount.audit_logs as Array);
			acct.auditLogs = new ArrayCollection();
			for each(var log:Object in logs)
			{
				acct.auditLogs.addItem(new AuditLog(log.audit_log, acct.name));
			}
			
			
			return acct;
		}
		
		public function update(cloudAccount:Object):void
		{
			name = cloudAccount["name"];
			description = cloudAccount["description"];
			cloud_name = cloudAccount["cloud_name"];
			cloud_provider = cloudAccount["cloud_provider"];
			cloud_id = cloudAccount["cloud_id"];
			access_key = cloudAccount["access_key"];
			secret_key = cloudAccount["secret_key"];
			cloudAttributes = cloudAccount["cloud_attributes"];
			topstackEnabled = Boolean(cloudAccount["topstack_enabled"]);
			if(cloudAccount["stack_preferences"] == null)
			{
				stackPreferences = new Object();
			}else
			{
				stackPreferences = cloudAccount["stack_preferences"];
			}
			
			var tmpCollection:ArrayCollection = new ArrayCollection(cloudAccount.audit_logs as Array);
			auditLogs.removeAll();
			for each(var log:Object in tmpCollection)
			{
				auditLogs.addItem(new AuditLog(log.audit_log, name));
			}
			
			id = cloudAccount["id"];
		}
		
		public function toString():String
		{
			return name;
		}
		
		public function toObject():Object
		{
			return {cloud_account:{
				name: name,
				description: description,
				access_key: access_key,
				secret_key: secret_key,
				cloud_attributes: cloudAttributes,
				stack_preferences: stackPreferences}
			};
		}
		
		public function get icon():Class
		{
			switch(cloud_provider)
			{
				case AMAZON:
					return amazonIcon;
					break;
				case EUCALYPTUS:
					return eucalyptusIcon;
					break;
				case OPENSTACK:
					return openstackIcon;
					break;
				default:
					return null;
					break;
			}
		}
		
		public function get coverFlow():BitmapAsset
		{
			var imgObj:BitmapAsset;
			switch(cloud_provider)
			{
				case AMAZON:
					imgObj = new amazonCoverFlow() as BitmapAsset;
					break;
				case EUCALYPTUS:
					imgObj = new eucalyptusCoverFlow() as BitmapAsset;
					break;
				case OPENSTACK:
					imgObj = new openstackCoverFlow() as BitmapAsset;
					break;
				case HP:
					imgObj = new hpCoverFlow() as BitmapAsset;
					break;
				case RACKSPACE:
					imgObj = new rackspaceCoverFlow() as BitmapAsset;
					break;
				case JOYENT:
					imgObj = new joyentCoverFlow() as BitmapAsset;
					break;
				case CLOUDSTACK:
					imgObj = new cloudstackCoverFlow() as BitmapAsset;
					break;
				case PISTON:
					imgObj = new pistonCoverFlow() as BitmapAsset;
					break;
				case AZURE:
					imgObj = new azureCoverFlow() as BitmapAsset;
					break;
			}
			return imgObj;
		}
		
		public function get puppetServerUrl():String
		{
			return stackPreferences.puppet_server_url;
		}
		
		public function get chefServerUrl():String
		{
			return stackPreferences.chef_server_url;
		}
		
		public function get chefBucket():String
		{
			return stackPreferences.chef_bucket;
		}
		
		public function get puppetBucket():String
		{
			return stackPreferences.puppet_bucket;
		}
	}
}