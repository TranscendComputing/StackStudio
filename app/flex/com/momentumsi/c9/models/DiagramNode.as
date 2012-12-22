package com.momentumsi.c9.models
{
	import com.momentumsi.c9.constants.ResourceType;
	import com.momentumsi.c9.services.CloudApiService;
	
	import flash.events.Event;
	import flash.events.EventDispatcher;
	
	import fr.kapit.diagrammer.base.uicomponent.DiagramSprite;
	
	import mx.rpc.events.ResultEvent;
	
	public class DiagramNode extends EventDispatcher
	{
		public var cloudAccountId:String;
		public var region:String;
		public var node:DiagramSprite;
		private var updateService:CloudApiService;
		public function DiagramNode()
		{
			super();
		}
		
		public function update():void
		{
			var provisionedInstance:ProvisionedInstance = ProvisionedInstance(node.data);
			updateService = new CloudApiService();
			updateService.cloudAccountId = cloudAccountId;
			updateService.region = region;
			updateService.addEventListener(ResultEvent.RESULT, updateNodeData_resultHandler);
			
			if(provisionedInstance.status != ProvisionedInstance.TERMINATED && provisionedInstance.instanceId != null)
			{
				switch(provisionedInstance.type)
				{
					case ResourceType.EC2_INSTANCE:
						if(provisionedInstance.instanceId.match(/i-[a-zA-Z0-9]{8}/) != null)
						{
							updateService.action = "describe_instances";
							updateService.serviceType = CloudApiService.EC2_SERVICE;
						}						
						break;
					case ResourceType.EC2_SECURITY_GROUP:
						updateService.action = "describe_security_groups";
						updateService.serviceType = CloudApiService.EC2_SERVICE;
						break;
					case ResourceType.EBS_VOLUME:
						updateService.action = "describe_volumes";
						updateService.serviceType = CloudApiService.EC2_SERVICE;
						break;
					case ResourceType.LOAD_BALANCER:
						updateService.action = "describe_load_balancers";
						updateService.serviceType = CloudApiService.ELB_SERVICE;
						break;
					case ResourceType.AS_GROUP:
						updateService.action = "describe_auto_scaling_groups";
						updateService.serviceType =  CloudApiService.AS_SERVICE;
						break;
					case ResourceType.DB_INSTANCE:
						updateService.action = "describe_db_instances";
						updateService.serviceType = CloudApiService.RDS_SERVICE;
						break;
					case ResourceType.S3_BUCKET:
						updateService.action = "list_bucket";
						updateService.serviceType =  CloudApiService.S3_SERVICE;
						break;
					case ResourceType.SNS_TOPIC:
						updateService.action = "topic_details";
						updateService.serviceType =  CloudApiService.SNS_SERVICE;
						break;
					case ResourceType.BEANSTALK_APP:
						updateService.action = "describe_applications";
						updateService.serviceType =  CloudApiService.BEANSTALK_SERVICE;
						break;
					case ResourceType.SQS_QUEUE:
						updateService.action = "get_queue_attributes";
						updateService.serviceType =  CloudApiService.SQS_SERVICE;
						break;
					case ResourceType.CACHE_CLUSTER:
						updateService.action = "describe_clusters";
						updateService.serviceType =  CloudApiService.CACHE_SERVICE;
						break;
					case ResourceType.IAM_GROUP:
						updateService.action = "get_group";
						updateService.serviceType = CloudApiService.IAM_SERVICE;
						break;
					case ResourceType.IAM_USER:
						updateService.action = "get_user";
						updateService.serviceType = CloudApiService.IAM_SERVICE;
						break;
					case ResourceType.EMBEDDED_STACK:
						updateService.action = "describe_embedded_stack";
						updateService.serviceType = CloudApiService.CF_SERVICE;
						break;
					case ResourceType.CW_ALARM:
						updateService.action = "describe_alarm";
						updateService.serviceType = CloudApiService.ACW_SERVICE;
						break;
					case ResourceType.SIMPLE_DB_INSTANCE:
						updateService.action = "domain_metadata";
						updateService.serviceType = CloudApiService.SIMPLE_DB_SERVICE;
						break;
					case ResourceType.CLOUD_FRONT:
						updateService.action = "get_distribution";
						updateService.serviceType = CloudApiService.CDN_SERVICE;
				}
				if(updateService.action != null)
				{
					updateService.request = {physical_id: provisionedInstance.instanceId};
					updateService.send();
				}
			}
		}
		
		private function updateNodeData_resultHandler(event:ResultEvent):void
		{
			var pi:ProvisionedInstance = ProvisionedInstance(node.data);
			pi.properties = updateService.result;
			node.data = pi;
			
			var index:int = 0;
			var dNode:DiagramNode;

			var linkedNodeData:ProvisionedInstance;
			for each(var linkedNode:DiagramSprite in node.outConnections)
			{
				linkedNodeData = linkedNode.data as ProvisionedInstance;
				if(linkedNodeData.instanceId != null)
				{
					return;
				}
				try
				{
					if(pi.type == ResourceType.AS_GROUP)
					{
						linkedNodeData.instanceId = pi.properties["Instances"][index]["InstanceId"];
					}else if(pi.type ==ResourceType.CACHE_CLUSTER)
					{
						linkedNodeData.resourceId = pi.properties["CacheNodes"][index]["CacheNodeId"];
						linkedNodeData.properties = pi.properties["CacheNodes"][index];
					}else if(pi.type == ResourceType.LOAD_BALANCER)
					{
						
					}
				}catch(error:Error){
					// No more instances running
					return;
				}
				linkedNode.data = linkedNodeData;
				dNode = new DiagramNode();
				dNode.cloudAccountId = cloudAccountId;
				dNode.node = linkedNode;
				dNode.update();
				index++;
			}
			dispatchEvent(new ResultEvent(ResultEvent.RESULT, false, true, pi));
		}
		
		//Used to cancel service call response when changing versions
		public function cancelUpdate():void
		{
			updateService.cancel();
		}
			
	}
}