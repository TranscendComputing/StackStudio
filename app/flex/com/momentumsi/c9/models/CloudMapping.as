package com.momentumsi.c9.models
{
	import com.momentumsi.c9.services.CloudService;
	import com.momentumsi.c9.utils.IntrinsicFunctionUtil;
	
	import flash.events.EventDispatcher;
	import flash.events.IEventDispatcher;
	
	import mx.collections.ArrayCollection;
	import mx.rpc.events.ResultEvent;
	import mx.utils.StringUtil;
	
	[Bindable]
	public class CloudMapping extends EventDispatcher
	{
		public static const CF_IMAGE_MAP_TYPE:String = "CloudFormation Image Map";
		public static const IMAGE_TYPE:String = "image";
		public var name:String
		public var type:String;
		public var properties:Object = new Object();
		public var entries:ArrayCollection = new ArrayCollection();
		public var id:String;
		
		private var cloudService:CloudService = new CloudService();
		private var cloud:Cloud;
		public function CloudMapping(target:IEventDispatcher=null)
		{
			super(target);
			cloudService.addEventListener(ResultEvent.RESULT, updateCloud);
		}
		
		public static function buildCloudMapping(mapping:Object):CloudMapping
		{
			var newMapping:CloudMapping = new CloudMapping();
			newMapping.name = mapping.name;
			newMapping.type = mapping.mapping_type;
			newMapping.properties = mapping.properties;
			var tmpColl:ArrayCollection = new ArrayCollection(mapping.mapping_entries as Array);
			for each(var item:Object in tmpColl)
			{
				if(item.hasOwnProperty("image_id")){
					newMapping.entries.addItem(new MappingEntry([item.region, item.image_id]));
				}else if(item.hasOwnProperty("key")){
					newMapping.entries.addItem(new MappingEntry([item.key, item.value]));
				}else{
					newMapping.entries.addItem(new MappingEntry(item as Array));
				}
			} 
			newMapping.id = mapping.id;
			return newMapping;
		}
		
		override public function toString():String
		{
			var trimmedName:String = name.replace(/\s/g,"");
			trimmedName = trimmedName.replace("-", "");
			return trimmedName;
		}
		
		public function toObject():Object
		{
			return {cloud_mapping:
				{name: name,
				mapping_type: type,
				properties: properties,
				mapping_entries: entries.toArray()}};
		}
		
		public function createMapping(cloud:Cloud):void
		{
			cloudService.cloudId = cloud.id;
			cloudService.createNewMapping(this);
		}
		
		public function deleteMapping(cloud:Cloud):void
		{
			cloudService.cloudId = cloud.id;
			cloudService.deleteMapping(id);
		}
		
		private function updateCloud(event:ResultEvent):void
		{
			cloud.update(cloudService.result["cloud"]);
		}
		
		public function toTemplateObject():Object
		{
			var mapObject:Object = new Object();
			var mapName:String = this.toString();
			mapObject[mapName] = new Object();
			for each(var img:Object in entries)
			{
				mapObject[mapName][img.region] = new Object();
				mapObject[mapName][img.region]['AMI'] = img.image_id;
			}
			return mapObject;
		}
		
		public function toImageReference():Object
		{
			var imageReference:Object = new Object();
			imageReference[IntrinsicFunctionUtil.FIND_IN_MAP] = [this.toString(), IntrinsicFunctionUtil.REF_REGION, "AMI"];
			return imageReference;
		}
		
		public function get operatingSystem():String
		{
			return properties.operating_system;
		}
		
		public function get rootDeviceType():String
		{
			return properties.root_device_type;
		}
		
		public function get virtualizationType():String
		{
			return properties.virtualization_type;
		}
		
		public function get architecture():String
		{
			return properties.architecture;
		}
	}
}