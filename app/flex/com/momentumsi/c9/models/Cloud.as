package com.momentumsi.c9.models
{
	import com.momentumsi.c9.services.CloudService;
	
	import mx.collections.ArrayCollection;
	import mx.core.BitmapAsset;

	[Bindable]
	public class Cloud
	{
		public var id:String;
		public var name:String;
		public var cloudProvider:String;
		public var permalink:String;
		public var isPublic:Boolean;
		public var url:String;
		public var topstackId:String;
		public var topstackEnabled:Boolean;
		public var cloudServices:ArrayCollection = new ArrayCollection();
		public var cloudMappings:ArrayCollection = new ArrayCollection();
		
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
		
		private var cloudService:CloudService;

		public function Cloud()
		{

		}
		
		public static function buildCloud(cloud:Object):Cloud
		{
			var c:Cloud = new Cloud()
			c.id = cloud["id"];
			c.name = cloud["name"];
			c.permalink = cloud["permalink"];
			c.isPublic = cloud["public"];
			c.cloudProvider = cloud["cloud_provider"];
			c.url = cloud["url"];
			c.topstackEnabled = Boolean(cloud["topstack_enabled"]);
			c.topstackId = cloud["topstack_id"];
			
			var mappings:ArrayCollection = new ArrayCollection(cloud["cloud_mappings"] as Array);
			var services:ArrayCollection = new ArrayCollection(cloud["cloud_services"] as Array);
			for each(var map:Object in mappings)
			{
				c.cloudMappings.addItem(CloudMapping.buildCloudMapping(map.cloud_mapping));
			}
			
			for each(var service:Object in services)
			{
				c.cloudServices.addItem(CloudServiceModel.buildCloudService(service.cloud_service));
			}
			return c;			
		}
		
		public function update(cloud:Object):void
		{
			name = cloud["name"];
			cloudProvider = cloud["cloud_provider"];
			permalink = cloud["permalink"];
			isPublic = cloud["public"];
			topstackId = cloud["topstack_id"];
			topstackEnabled = Boolean(cloud["topstack_enabled"]);
				
			var holder:ArrayCollection;
			var item:Object;
			
			holder= new ArrayCollection(cloud["cloud_mappings"] as Array);
			cloudMappings.removeAll();
			for each(item in holder)
			{
				cloudMappings.addItem(CloudMapping.buildCloudMapping(item.cloud_mapping));
			}
			
			holder= new ArrayCollection(cloud["cloud_services"] as Array);
			cloudServices.removeAll();
			for each(item in holder)
			{
				cloudServices.addItem(CloudServiceModel.buildCloudService(item.cloud_service));
			}
		}
		
		public function toString():String
		{
			return this.name;
		}
		
		public function removeService(serviceId:String):void
		{
			cloudService = new CloudService();
			cloudService.cloud = this;
			cloudService.removeService(serviceId);
		}
		
		public function addService(service:CloudServiceModel):void
		{
			cloudService = new CloudService();
			cloudService.cloud = this;
			cloudService.addService(service);
		}
		
		public function get coverFlow():BitmapAsset
		{
			var imgObj:BitmapAsset;
			switch(cloudProvider)
			{
				case CloudAccount.AMAZON:
					imgObj = new amazonCoverFlow() as BitmapAsset;
					break;
				case CloudAccount.EUCALYPTUS:
					imgObj = new eucalyptusCoverFlow() as BitmapAsset;
					break;
				case CloudAccount.OPENSTACK:
					imgObj = new openstackCoverFlow() as BitmapAsset;
					break;
				case CloudAccount.HP:
					imgObj = new hpCoverFlow() as BitmapAsset;
					break;
				case CloudAccount.RACKSPACE:
					imgObj = new rackspaceCoverFlow() as BitmapAsset;
					break;
				case CloudAccount.JOYENT:
					imgObj = new joyentCoverFlow() as BitmapAsset;
					break;
				case CloudAccount.CLOUDSTACK:
					imgObj = new cloudstackCoverFlow() as BitmapAsset;
					break;
				case CloudAccount.PISTON:
					imgObj = new pistonCoverFlow() as BitmapAsset;
					break;
				case CloudAccount.AZURE:
					imgObj = new azureCoverFlow() as BitmapAsset;
					break;
			}
			return imgObj;
		}
	}
}