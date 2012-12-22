package com.momentumsi.c9.models
{
	import com.maccherone.json.JSON;
	import com.momentumsi.c9.constants.ResourceType;
	import com.momentumsi.c9.services.ProjectService;
	import com.momentumsi.c9.services.ProvisioningService;
	
	import flash.events.Event;
	import flash.events.EventDispatcher;
	
	import mx.collections.ArrayCollection;
	import mx.rpc.events.ResultEvent;

	[Bindable]
	public class ProvisionedVersion extends EventDispatcher
	{
		public var id:String;
		public var stackName:String;
		public var version:String;
		public var environment:String;
		public var provisionedInstances:ArrayCollection;
		
		public static const INSTANCES_UPDATED:String = "instancesUpdated";
		
		private var pvService:ProvisioningService = new ProvisioningService();
		
		public function ProvisionedVersion(id:String, stackName:String, version:String, environment:String, provisionedInstances:ArrayCollection)
		{
			this.id = id;
			this.stackName = stackName;
			this.version = version;
			this.environment = environment;
			this.provisionedInstances = provisionedInstances;
			
			pvService.provisionedVersion = this;
		}
		
		public static function buildProvisionedVersion(provVersion:Object):ProvisionedVersion
		{
			var pv:ProvisionedVersion;
			
			var pInstCollection:ArrayCollection = new ArrayCollection();
			var instances:ArrayCollection = new ArrayCollection(provVersion["provisioned_instances"] as Array);
			for each(var instance:Object in instances)
			{
				pInstCollection.addItem(ProvisionedInstance.buildProvisionedInstance(instance["provisioned_instance"]));
			}
			
			pv = new ProvisionedVersion(provVersion["id"], provVersion["stack_name"], provVersion["version"], provVersion["environment"], pInstCollection);
			
			return pv;
		}
		
		public function update(provisionedVersion:Object):void
		{
			var instances:ArrayCollection = new ArrayCollection(provisionedVersion["provisioned_instances"] as Array);
			var instance:Object;
			if(instances.length == 0)
			{
				provisionedInstances.removeAll();
				return;
			}else{
				if(provisionedInstances.length == 0)
				{
					for each(instance in instances)
					{
						provisionedInstances.addItem(ProvisionedInstance.buildProvisionedInstance(instance["provisioned_instance"]));
					}
				}else{
					for each(instance in instances)
					{
						for each(var pi:ProvisionedInstance in provisionedInstances)
						{
							if(instance.provisioned_instance.resource_id == pi.resourceId)
							{
								pi.update(instance.provisioned_instance);
							}
						}
					}
				}
			}

			id = provisionedVersion["id"];
			stackName = provisionedVersion["stack_name"];
			version = provisionedVersion["version"];
			environment = provisionedVersion["environment"];
		}
		
		public function toObject():Object
		{
			return {
				provisioned_version:{
					stack_name: stackName,
					version: version,
					environment: environment
				}
			}
		}
		
		private var _projectSvc:ProjectService = new ProjectService();
		public function set initialNodes(nodes:ArrayCollection):void
		{
			var instArray:Array = [];
			var instanceProperties:Object;
			var type:String;
			for each(var node:Node in nodes)
			{
				if(node.view == Node.DESIGN_VIEW)
				{
					if(node.properties is String)
					{
						node.properties = JSON.decode(node.properties.toString());
					}
					
					instanceProperties = new Object();					
					instanceProperties.status = ProvisionedInstance.LAUNCHING;
					instanceProperties.coordinates = {x: node.x, y:node.y};
					/*if(node.properties.Type == ResourceType.CHEF_ROLE || node.properties.Type == ResourceType.PUPPET_MODULE)
					{
						type = node.properties.elementProperties.Type;
						instanceProperties.roles = node.properties.roles;
						instanceProperties.Properties = node.properties.elementProperties.Properties;
					}else{
						type = node.properties.Type;
						instanceProperties.Properties = node.properties.Properties;
					}*/
					type = node.properties.Type;
					instanceProperties.roles = node.properties.roles;
					instanceProperties.platform = node.properties.platform;
					if(node.properties.Type == ResourceType.CHEF_ROLE || node.properties.Type == ResourceType.PUPPET_MODULE)
					{	
						instanceProperties.Properties = node.properties.elementProperties.Properties;
					}else{
						instanceProperties.Properties = node.properties.Properties;
					}
					instArray.push({
						provisioned_instance: {
							instance_type: type,
							instance_id: "undefined", 
							resource_id: node.name,
							properties: instanceProperties
						}
					});
				}
			}
			_projectSvc.projectId = node.projectId;
			_projectSvc.addEventListener(ResultEvent.RESULT, setProvisionedInstances);
			_projectSvc.createProvisionedInstances(instArray, id);
		}
		
		private function setProvisionedInstances(event:ResultEvent):void
		{
			if(provisionedInstances == null){
				provisionedInstances = new ArrayCollection();
			}
			
			for(var index:int=0; index < _projectSvc.result["provisioned_version"]["provisioned_instances"].length; index++)
			{
				provisionedInstances.addItem(ProvisionedInstance.buildProvisionedInstance(_projectSvc.result["provisioned_version"]["provisioned_instances"][index]["provisioned_instance"]));
			}
			dispatchEvent(new Event(INSTANCES_UPDATED));
		}
		
		public function deleteVersion():void
		{
			_projectSvc = new ProjectService();
			_projectSvc.deleteProvisionedVersion(this);
			_projectSvc.addEventListener(ResultEvent.RESULT, deleteVersion_resultHandler);
		}
		
		public function updateProvisionedInstance(instance:ProvisionedInstance):void
		{
			pvService.updateInstance(instance);
		}
		
		/******************************
		 * Result Handlers
		 * ***************************/
		
		private function deleteVersion_resultHandler(event:ResultEvent):void
		{
			provisionedInstances.removeAll();
		}
	}
}