package com.momentumsi.c9.services
{
	import com.momentumsi.c9.events.provisionedVersion.UpdateProvisionedInstanceFaultEvent;
	import com.momentumsi.c9.events.provisionedVersion.UpdateProvisionedInstanceResultEvent;
	import com.momentumsi.c9.models.ProvisionedInstance;
	import com.momentumsi.c9.models.ProvisionedVersion;
	
	import mx.collections.ArrayCollection;
	import mx.rpc.events.FaultEvent;
	import mx.rpc.events.ResultEvent;

	[Event(name="updateProvisionedInstanceResult", type="com.momentumsi.c9.events.provisionedVersion.UpdateProvisionedInstanceResultEvent")]
	[Event(name="updateProvisionedInstanceFault", type="com.momentumsi.c9.events.provisionedVersion.UpdateProvisionedInstanceFaultEvent")]
	
	[Bindable]
	public class ProvisioningService extends ApiService
	{
		public var provisionedVersion:ProvisionedVersion;
		private var provisioningUrl:String;
		
		public function ProvisioningService(rootURL:String=null, destination:String=null)
		{
			super(rootURL, destination);
			provisioningUrl = this.url + "/stackstudio/v1/provisioning/";
		}
		
		public function create(projectId:String):void
		{
			setPost();
			url = provisioningUrl + projectId;
			request = provisionedVersion.toObject();
			addEventListener(ResultEvent.RESULT, createProvisionedVersion_resultHandler);
			send();
		}
		
		public function createProvisionedInstances(instances:Array):void
		{
			setPost();
			url = provisioningUrl + provisionedVersion.id + "/instances";
			request = {instances: instances};
			addEventListener(ResultEvent.RESULT, createProvisionedInstances_resultHandler);
			send();
		}
		
		public function getDetails():void
		{
			url = provisioningUrl + provisionedVersion.id + ".json";
			addEventListener(ResultEvent.RESULT, getDetails_resultHandler);
			send();
		}
		
		public function deleteProvisionedVersion():void
		{
			setPost();
			url = provisioningUrl + provisionedVersion.id + "?_method=DELETE";
			send();
		}
		
		public function updateInstance(instance:ProvisionedInstance):void
		{
			setPost();
			url = provisioningUrl + provisionedVersion.id + "/instances/" + instance.id + "?_method=PUT";
			request = instance.toObject();
			addEventListener(ResultEvent.RESULT, updateInstance_resultHandler);
			addEventListener(FaultEvent.FAULT, updateInstance_faultHandler);
			send();
		}
		
		/***********************
		 * Result Handlers
		 * *********************/
		
		private function createProvisionedVersion_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, createProvisionedVersion_resultHandler);
			provisionedVersion.id = result.provisioned_version.id;
			/*var newProvisionedVersion:ProvisionedVersion = ProvisionedVersion.buildProvisionedVersion(result["provisioned_version"]); 
			project.currentProvisionedVersion = newProvisionedVersion;
			project.provisionedVersions.addItem(newProvisionedVersion);
			project.currentProvisionedVersion.addEventListener(ProvisionedVersion.INSTANCES_UPDATED, initialProvisionedInstancesSet);
			project.currentProvisionedVersion.initialNodes = project.currentVersion.nodes;*/
		}
		
		private function createProvisionedInstances_resultHandler(event:ResultEvent):void
		{
			var resultCollection:ArrayCollection = new ArrayCollection(result["provisioned_version"]["provisioned_instances"]);
			for each(var instance:Object in resultCollection)
			{
				provisionedVersion.provisionedInstances.addItem(ProvisionedInstance.buildProvisionedInstance(instance));
			}
		}
		
		private function getDetails_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, getDetails_resultHandler);
			provisionedVersion.update(result["provisioned_version"]);
			
			/*if(project.currentProvisionedVersion == null)
			{
				var newProvisionedVersion:ProvisionedVersion = ProvisionedVersion.buildProvisionedVersion(result["provisioned_version"]); 
				project.currentProvisionedVersion = newProvisionedVersion;
				project.provisionedVersions.addItem(newProvisionedVersion);
			}else{
				project.currentProvisionedVersion.update(result["provisioned_version"]);
				for each(var proVersion:ProvisionedVersion in project.provisionedVersions)
				{
					if(proVersion.id == result["provisioned_version"]["id"])
					{
						project.provisionedVersions.setItemAt(project.currentProvisionedVersion, project.provisionedVersions.getItemIndex(proVersion));
					}
				}
			}
			project.dispatchEvent(new ProjectEvent(ProjectEvent.PROVISIONED_VERSION_SET, project));*/
		}
		
		private function updateInstance_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, updateInstance_resultHandler);
			dispatchEvent(new UpdateProvisionedInstanceResultEvent(result));
		}
		
		/*****************
		 * Fault Handlers
		 * **************/
		
		private function updateInstance_faultHandler(event:FaultEvent):void
		{
			removeEventListener(FaultEvent.FAULT, updateInstance_faultHandler);
			dispatchEvent(new UpdateProvisionedInstanceFaultEvent(event.fault));
		}
	}
}