package com.momentumsi.c9.services
{
	import com.adobe.serialization.json.JSON;
	import com.momentumsi.c9.components.Ec2ObjectManagementWizard;
	import com.momentumsi.c9.events.compute.*;
	import com.momentumsi.c9.models.aws_types.Ec2Image;
	import com.momentumsi.c9.models.resources.ChefCookbook;
	import com.momentumsi.c9.models.resources.ChefRole;
	import com.momentumsi.c9.models.resources.ComputeWizardObjectRepresenter;
	import com.momentumsi.c9.models.resources.PuppetClass;
	import com.momentumsi.c9.models.resources.PuppetModule;
	import com.momentumsi.c9.representers.ComputeRepresenter;
	import com.momentumsi.c9.representers.ComputeSecurityGroupRepresenter;
	import com.momentumsi.c9.representers.ReservedInstanceOfferingRepresenter;
	import com.momentumsi.c9.representers.SpotPrice;
	import com.momentumsi.c9.utils.Helpers;
	
	import flash.events.Event;
	import flash.net.URLRequestMethod;
	
	import mx.collections.ArrayCollection;
	import mx.rpc.events.FaultEvent;
	import mx.rpc.events.ResultEvent;

	[Event(name="securityGroupCreated", type="flash.events.Event")]
	[Event(name="securityGroupError", type="flash.events.Event")]
	
	[Event(name="authorizePortRangeResult", type="com.momentumsi.c9.events.compute.AuthorizePortRangeResultEvent")]
	[Event(name="authorizePortRangeFault", type="com.momentumsi.c9.events.compute.AuthorizePortRangeFaultEvent")]
	[Event(name="revokePortRangeResult", type="com.momentumsi.c9.events.compute.RevokePortRangeResultEvent")]
	[Event(name="revokePortRangeFault", type="com.momentumsi.c9.events.compute.RevokePortRangeFaultEvent")]
	[Event(name="createSecurityGroupResult", type="com.momentumsi.c9.events.compute.CreateSecurityGroupResultEvent")]
	[Event(name="createSecurityGroupFault", type="com.momentumsi.c9.events.compute.CreateSecurityGroupFaultEvent")]
	[Event(name="describeReservedInstancesOfferingsResult", type="com.momentumsi.c9.events.compute.DescribeReservedInstancesOfferingsResultEvent")]
	[Event(name="describeSecurityGroupsResult", type="com.momentumsi.c9.events.compute.DescribeSecurityGroupsResultEvent")]
	[Event(name="describeSpotPriceHistoryResult", type="com.momentumsi.c9.events.compute.DescribeSpotPriceHistoryResultEvent")]
	[Event(name="getPuppetClassesResult", type="com.momentumsi.c9.events.compute.GetPuppetClassesResultEvent")]
	[Event(name="getRolesResult", type="com.momentumsi.c9.events.compute.GetRolesResultEvent")]
	[Event(name="getRolesFault", type="com.momentumsi.c9.events.compute.GetRolesFaultEvent")]
	[Event(name="getRunListResult", type="com.momentumsi.c9.events.compute.GetRunListResultEvent")]
	[Event(name="getRunListFault", type="com.momentumsi.c9.events.compute.GetRunListFaultEvent")]
	[Event(name="getResourcesResult", type="com.momentumsi.c9.events.compute.GetResourcesResultEvent")]
	[Event(name="getResourcesFault", type="com.momentumsi.c9.events.compute.GetResourcesFaultEvent")]
	[Event(name="purchaseReservedInstancesOfferingResult", type="com.momentumsi.c9.events.compute.PurchaseReservedInstancesOfferingResultEvent")]
	[Event(name="startInstanceResult", type="com.momentumsi.c9.events.compute.StartInstanceResultEvent")]
	[Event(name="startInstanceFault", type="com.momentumsi.c9.events.compute.StartInstanceFaultEvent")]
	[Event(name="stopInstanceResult", type="com.momentumsi.c9.events.compute.StopInstanceResultEvent")]
	[Event(name="stopInstanceFault", type="com.momentumsi.c9.events.compute.StopInstanceFaultEvent")]
	[Event(name="rebootInstanceResult", type="com.momentumsi.c9.events.compute.RebootInstanceResultEvent")]
	[Event(name="rebootInstanceFault", type="com.momentumsi.c9.events.compute.RebootInstanceFaultEvent")]
	[Event(name="getConsoleOutputResult", type="com.momentumsi.c9.events.compute.GetConsoleOutputResultEvent")]
	[Event(name="getConsoleOutputFault", type="com.momentumsi.c9.events.compute.GetConsoleOutputFaultEvent")]
	[Event(name="computeServiceFault", type="com.momentumsi.c9.events.compute.ComputeServiceFaultEvent")]
	
	[Bindable]
	public class Ec2Service extends CloudApiService
	{
		
		//Actions
		public static const AUTHORIZE_PORT_RANGE:String = "authorize_port_range";
		public static const REVOKE_PORT_RANGE:String = "revoke_port_range";
		public static const CREATE_SECURITY_GROUP:String = "create_security_group";
		public static const DESCRIBE_INSTANCES:String = "describe_instances";
		public static const GET_CONSOLE_OUTPUT:String = "get_console_output";
		public static const GET_ROLES:String = "get_roles";
		public static const GET_MODULES:String = "get_puppet_modules";
		public static const GET_RUN_LIST:String = "get_role_details";
		public static const START_INSTANCE:String = "start_instance";
		public static const STOP_INSTANCE:String = "stop_instance";
		public static const REBOOT_INSTANCE:String = "reboot_instance";
		public static const DESCRIBE_RESERVED_OFFERINGS:String = "describe_reserved_instances_offerings";
		public static const DESCRIBE_SECURITY_GROUPS:String = "describe_security_groups";
		public static const DESCRIBE_SPOT_PRICE_HISTORY:String = "describe_spot_price_history";
		public static const PURCHASE_RESERVED_INSTANCES_OFFERING:String = "purchase_reserved_instances_offering";
		public static const DESCRIBE_AVAILABILITY_ZONES:String = "describe_availability_zones";
		
		/**************
		 * Event constants
		 * ************/
		public static const SECURITY_GROUP_CREATED:String = "securityGroupCreated";
		public static const SECURITY_GROUP_ERROR:String = "securityGroupError";
		public static const RESOURCES_SET:String = "resourcesSet";
		
		public var objectManagement:Boolean = false;
		public var objectManagementWizard:Ec2ObjectManagementWizard;
		public var instanceRepresenter:ComputeWizardObjectRepresenter;
		
		/***********************
		 * 	Instance Resources
		 * *********************/
		public var userImages:ArrayCollection = new ArrayCollection();
		public var designatedImages:ArrayCollection;
		public var computePrices:ArrayCollection;
		public var keyPairs:ArrayCollection;
		public var runningInstances:ArrayCollection = new ArrayCollection();
		public var securityGroups:ArrayCollection = new ArrayCollection();
		public var elasticIps:ArrayCollection;
		public var availabilityZones:ArrayCollection;
		public var diskOfferings:ArrayCollection;
		public var types:ArrayCollection;
		public var userData:String;
		public var keyMaterial:String;
		public var reservedInstanceOfferings:ArrayCollection;
		public var roles:ArrayCollection = new ArrayCollection();
		public var puppetClasses:ArrayCollection = new ArrayCollection();
		public var roleRunList:ArrayCollection = new ArrayCollection();
		public var spotPriceHistory:ArrayCollection = new ArrayCollection();
		public var currentSpotPrice:String = "0.026";
		
		public static const AWS_32BIT_TYPES:ArrayCollection = new ArrayCollection([
			{label: "t1.micro (Up to 2 ECUs, 1 Core, 613 MB)", value: "t1.micro"},
			{label:"m1.small (1 ECU, 1 Core, 1.7 GB)", value:"m1.small"},
			{label:"c1.medium (5 ECUs, 2 Cores, 1.7 GB)", value:"c1.medium"}])
		
		public static const AWS_64BIT_TYPES:ArrayCollection = new ArrayCollection([
			{label:"t1.micro (Up to 2 ECUs, 1 Core, 613 MB)" ,value:"t1.micro"},
			{label:"m1.large (4 ECUs, 2 Cores, 7.5 GB)" ,value:"m1.large"},
			{label:"m1.xlarge (8 ECUs, 4 Cores, 15 GB)" ,value:"m1.xlarge"},
			{label:"m2.xlarge (6.5 ECUs, 2 Cores, 17.1 GB)" ,value:"m2.xlarge"},
			{label:"m2.2xlarge (13 ECUs, 4 Cores 34.2 GB)" ,value:"m2.2xlarge"},
			{label:"m2.4xlarge (26 ECUs 8 Cores, 68.4 GB)" ,value:"m2.4xlarge"},
			{label:"c1.xlarge (20 ECUs, 8 Cores, 7 GB)" ,value:"c1.xlarge"},
			{label:"cc1.4xlarge (33.5 ECUs, 23 GB)" ,value:"cc1.4xlarge"},
			{label:"cc2.8xlarge (88 ECUs, 60.5 GB)" ,value:"cc2.8xlarge"},
			{label:"cg1.4xlarge (33.5 ECUs, 22 GB)" ,value:"cg1.4xlarge"}]);
		
		public static const OS_TYPES:ArrayCollection = new ArrayCollection([
			{label: "m1.tiny (1 VCPU, 512 MB Mem)", value: "m1.tiny"},
			{label:"m1.small (1 VCPU, 1 GB Mem)", value:"m1.small"},
			{label:"m1.medium (1 VCPU, 1.5 GB Mem)", value:"m1.medium"},
			{label:"m1.large (2 VCPUs, 2 GB Mem)", value:"m1.large"},
			{label:"m1.xlarge (4 VCPUs, 3 GB Mem)", value:"m1.xlarge"}]);
		
		public static const EUCA_TYPES:ArrayCollection = new ArrayCollection([
			{label:"m1.small (1 VCPU, 128 MB Mem)", value:"m1.small"},
			{label:"c1.medium (1 VCPU, 256 MB Mem)", value:"c1.medium"},
			{label:"m1.large (1 VCPUs, 512 MB Mem)", value:"m1.large"},
			{label:"m1.xlarge (1 VCPUs, 1 GB Mem)", value:"m1.xlarge"},
			{label:"c1.xlarge (2 VCPUs, 2 GB Mem)", value:"c1.xlarge"}])

			
			
		
		public var instanceId:String;
		
		/***********************
		 * 	Volume Resources
		 * *********************/
		public var snapshots:ArrayCollection;
		
		public var volumeId:String;

		public function Ec2Service(rootURL:String=null, destination:String=null)
		{
			super(rootURL, destination);
			serviceType = EC2_SERVICE;
		}
		
		public function getEc2Resources(cloudId:String):void
		{
			action = "get_mgmt_resources";
			addEventListener(ResultEvent.RESULT, getEc2Resources_resultHandler);
			addEventListener(FaultEvent.FAULT, getEc2Resources_faultHandler);
			request = {cloud_id: cloudId};
			send();
		}
		
		public function launchEc2Instance(parameters:Object):void
		{
			action = "launch_instances";
			request = parameters;
			send();
		}
		
		public function requestSpotInstances(parameters:Object):void
		{
			setPost();
			action = "request_spot_instances";
			request = parameters;
			send();
		}
		
		public function describeKeyPairs():void
		{
			action = "describe_key_pairs";
			addEventListener(ResultEvent.RESULT, describeKeyPairs_resultHandler);
			send();
		}
		
		
		public function describeSecurityGroups():void
		{
			action = DESCRIBE_SECURITY_GROUPS;
			addEventListener(ResultEvent.RESULT, describeSecurityGroups_resultHandler);
			addEventListener(FaultEvent.FAULT, default_faultHandler);
			send();
		}
		
		public function describeInstanceAttribute(attribute:String="user_data"):void
		{
			action = "describe_instance_attribute";
			request = {physical_id: instanceId, attribute: attribute};
			addEventListener(ResultEvent.RESULT, describeInstanceAttribute_resultHandler);
			send();
		}
		
		public function createKeyPair(keyName:String):void
		{
			action = "create_key_pair";
			request = {key_pair_name: keyName};
			addEventListener(ResultEvent.RESULT, createKeyPair_resultHandler);
			send();
		}
		
		public function importKeyPair(keyName:String, publicKey:String):void
		{
			action = "import_key_pair";
			request = {key_pair_name: keyName, public_key: publicKey};
			send();
		}
		
		public function createSecurityGroup(name:String, description:String, options:Object=null):void
		{
			setPost();
			action = CREATE_SECURITY_GROUP;
			request = {
				group_name: name,
				description: description,
				options: options
			};
			addEventListener(ResultEvent.RESULT, createSecurityGroup_resultHandler);
			addEventListener(FaultEvent.FAULT, createSecurityGroup_faultHandler);
			send();
		}
		
		public function modifyInstanceAttribute(value:String):void
		{
			
		}
		
		public function allocateAddress():void
		{
			action = "allocate_address";
			addEventListener(ResultEvent.RESULT, allocateAddress_resultHandler);
			send();
		}
		
		public function associateAddress(address:String):void
		{
			action = "associate_address";
			request = {instance_id: instanceId, address: address};
			send();
		}
		
		public function disassociateAddress(address:String):void
		{
			action = "disassociate_address";
			request = {instance_id: instanceId, address: address};
			send();
		}
		
		public function releaseAddress(address:String):void
		{
			action = "release_address";
			request = {instance_id: instanceId, address: address};
			send();
		}
		
		public function authorizePortRange(groupId:String, min:String, max:String, options:Object):void
		{
			setPost();
			action = AUTHORIZE_PORT_RANGE;
			request = {
				id: groupId,
				min: min,
				max: max,
				options: options
			};
			addEventListener(ResultEvent.RESULT, authorizePortRange_resultHandler);
			addEventListener(FaultEvent.FAULT, authorizePortRange_faultHandler);
			send();
		}
		
		public function revokePortRange(groupId:String, min:String, max:String, options:Object):void
		{
			setPost();
			action = REVOKE_PORT_RANGE;
			request = {
				id: groupId,
				min: min,
				max: max,
				options: options
			};
			addEventListener(ResultEvent.RESULT, revokePortRange_resultHandler);
			addEventListener(FaultEvent.FAULT, revokePortRange_faultHandler);
			send();
		}
		
		public function startInstance():void
		{
			setPost();
			action = START_INSTANCE;
			request = {physical_id: instanceId};
			addEventListener(ResultEvent.RESULT, startInstance_resultHandler);
			addEventListener(FaultEvent.FAULT, startInstance_faultHandler);
			send();
		}
		
		public function stopInstance():void
		{
			setPost();
			action = STOP_INSTANCE;
			request = {physical_id: instanceId};
			addEventListener(ResultEvent.RESULT, stopInstance_resultHandler);
			addEventListener(FaultEvent.FAULT, stopInstance_faultHandler);
			send();
		}
		
		public function rebootInstance():void
		{
			setPost();
			action = REBOOT_INSTANCE;
			request = {physical_id: instanceId};
			addEventListener(ResultEvent.RESULT, rebootInstance_resultHandler);
			addEventListener(FaultEvent.FAULT, rebootInstance_faultHandler);
			send();
		}
		
		public function getConsoleOutput():void
		{
			setPost();
			action = GET_CONSOLE_OUTPUT;
			request = {physical_id: instanceId};
			addEventListener(ResultEvent.RESULT, getConsoleOutput_resultHandler);
			addEventListener(FaultEvent.FAULT, getConsoleOutput_faultHandler);
			send();
		}
		
		public function getRoles():void
		{
			action = GET_ROLES;
			request = {};
			addEventListener(ResultEvent.RESULT, getRoles_resultHandler);
			addEventListener(FaultEvent.FAULT, getRoles_faultHandler);
			send();
		}
		
		public function getRunList(runList:Array):void
		{
			setPost();
			action = GET_RUN_LIST;
			request = {
				run_list: runList
			};
			addEventListener(ResultEvent.RESULT, getRunList_resultHandler)
			addEventListener(FaultEvent.FAULT, getRunList_faultHandler);
			send();
		}
		
		public function getPuppetClasses():void
		{
			setPost();
			action = GET_MODULES;
			request = {};
			addEventListener(ResultEvent.RESULT, getPuppetClasses_resultHandler);
			addEventListener(FaultEvent.FAULT, default_faultHandler);
			send();
		}
		
		public function purchaseOfferings(offerings:Object):void
		{
			setPost();
			action = PURCHASE_RESERVED_INSTANCES_OFFERING;
			request = {offerings: offerings};
			addEventListener(ResultEvent.RESULT, purchaseOffering_resultHandler);
			addEventListener(FaultEvent.FAULT, default_faultHandler);
			send();
		}
		
		public function describeSpotPriceHistory(filters:Object=null):void
		{
			setPost();
			action = DESCRIBE_SPOT_PRICE_HISTORY;
			request = {filters: filters};
			addEventListener(ResultEvent.RESULT, describeSpotPriceHistory_resultHandler);
			addEventListener(FaultEvent.FAULT, default_faultHandler);
			send();
		}
		
		public function describeAvailabilityZones():void
		{
			setPost();
			action = DESCRIBE_AVAILABILITY_ZONES;
			addEventListener(ResultEvent.RESULT, describeAvailabilityZones_resultHandler);
			addEventListener(FaultEvent.FAULT, default_faultHandler);
			send();
		}
		
		/********************
		 * 	Reserved Instances Actions
		 * ******************/
		
		public function describeOfferings(filters:Object=null):void
		{
			setPost();
			action = DESCRIBE_RESERVED_OFFERINGS;
			request = {filters: filters};
			addEventListener(ResultEvent.RESULT, describeOfferings_resultHandler);
			addEventListener(FaultEvent.FAULT, describeOfferings_faultHandler);
			send();
		}
		
		/********************
		 * 	Volume Actions
		 * ******************/
		
		public function getEbsResources():void
		{
			action = "get_volume_resources";
			addEventListener(ResultEvent.RESULT, getEbsResources_resultHandler);
			send();
		}
		
		public function createVolume(parameters:Object):void
		{
			action = "create_volume";
			request = parameters;
			send();
		}
		
		/**********************
		 *   Result Handlers
		 * ********************/
		
		private function getEc2Resources_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, getEc2Resources_resultHandler);
			
			var item:Object;
			var responseCollection:ArrayCollection;
			elasticIps = new ArrayCollection(result["addresses"] as Array);
			elasticIps.addItemAt({public_ip: "None"}, 0);
			keyPairs = new ArrayCollection(result["keys"] as Array);
			securityGroups = new ArrayCollection(result["security_groups"] as Array);
			availabilityZones = new ArrayCollection(result["availability_zones"] as Array);
			computePrices = new ArrayCollection(result["compute_prices"] as Array);
			types = new ArrayCollection(result["types"] as Array);
			
			userImages = Helpers.resultToArrayCollection(result.user_images, Ec2Image);
			runningInstances = Helpers.resultToArrayCollection(result.instances, ComputeRepresenter);
			spotPriceHistory = Helpers.resultToArrayCollection(result.spot_price_history, SpotPrice);
			
			//Add current instance properties to collections if instanceRepresenter (project wizard) is not null
			if(instanceRepresenter)
			{
				if(instanceRepresenter.securityGroups)
				{
					var currentGroups:ArrayCollection = new ArrayCollection(instanceRepresenter.securityGroups);
					for each(var grp:Object in currentGroups)
					{
						if(!(grp is String))
						{
							securityGroups.addItemAt(grp, 0);
						}
					}
				}
			}
			
			if(objectManagement)
			{
				designatedImages = new ArrayCollection(result["designated_images"] as Array);
				objectManagementWizard.buildImageList();
			}
			dispatchEvent(new GetResourcesResultEvent(result));
		}
		
		private function getEbsResources_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, getEbsResources_resultHandler);
			availabilityZones = new ArrayCollection(result["availability_zones"] as Array);
			diskOfferings = new ArrayCollection(result["disk_offerings"] as Array);
			snapshots = new ArrayCollection(result["snapshots"] as Array);
		}
		
		private function describeKeyPairs_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, describeKeyPairs_resultHandler);
			keyPairs = new ArrayCollection(result as Array);
		}
		
		private function describeSecurityGroups_resultHandler(event:ResultEvent):void
		{
			securityGroups.removeAll();
			var responseCollection:ArrayCollection;
			removeEventListener(ResultEvent.RESULT, getEc2Resources_resultHandler);
			responseCollection = new ArrayCollection(result as Array);
			for each(var item:Object in responseCollection)
			{
				securityGroups.addItem(new ComputeSecurityGroupRepresenter(item));
			}
			dispatchEvent(new Event(RESOURCES_SET));
			dispatchEvent(new DescribeSecurityGroupsResultEvent(result));
		}
		
		private function describeInstanceAttribute_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, describeInstanceAttribute_resultHandler);
			userData = event.result.toString();
		}
		
		private function createKeyPair_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, createKeyPair_resultHandler);
			keyMaterial = String(result.private_key);
			describeKeyPairs();
		}
		
		private function allocateAddress_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, allocateAddress_resultHandler);			
		}
		
		private function createSecurityGroup_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, createSecurityGroup_resultHandler);
			dispatchEvent(new CreateSecurityGroupResultEvent(result));
		}
		
		private function authorizePortRange_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, authorizePortRange_resultHandler);
			dispatchEvent(new AuthorizePortRangeResultEvent(result));
		}
		
		private function revokePortRange_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, revokePortRange_resultHandler);
			dispatchEvent(new RevokePortRangeResultEvent(result));
		}
		
		private function getRoles_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, getRoles_resultHandler);
			var resultColl:ArrayCollection = new ArrayCollection(result as Array);
			roles.removeAll();
			for each(var item:Object in resultColl)
			{
				roles.addItem(new ChefRole(item));
			}
			dispatchEvent(new GetRolesResultEvent(result));
		}
		
		private function getRunList_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, getRunList_resultHandler);
			var resultColl:ArrayCollection = new ArrayCollection(result as Array);
			roleRunList.removeAll();
			for each(var item:Object in resultColl)
			{
				roleRunList.addItem(new ChefCookbook(item));
			}
			dispatchEvent(new GetRunListResultEvent(result));
		}
		
		private function getPuppetClasses_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, getPuppetClasses_resultHandler);
			var resultColl:ArrayCollection = new ArrayCollection(result as Array);
			puppetClasses.removeAll();
			for each(var item:Object in resultColl)
			{
				puppetClasses.addItem(new PuppetClass(item));
			}
			dispatchEvent(new GetPuppetClassesResultEvent(result));
		}
		
		private function startInstance_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, startInstance_resultHandler);
			dispatchEvent(new StartInstanceResultEvent(result));
		}
		
		private function stopInstance_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, stopInstance_resultHandler);
			dispatchEvent(new StopInstanceResultEvent(result));
		}
		
		private function rebootInstance_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, rebootInstance_resultHandler);
			dispatchEvent(new RebootInstanceResultEvent(result));
		}
		
		private function getConsoleOutput_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, getConsoleOutput_resultHandler);
			dispatchEvent(new GetConsoleOutputResultEvent(result));
		}
		
		private function describeOfferings_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, describeOfferings_resultHandler);
			
			reservedInstanceOfferings = new ArrayCollection();
			var resultColl:ArrayCollection = new ArrayCollection(result as Array);
			for each(var item:Object in resultColl)
			{
				reservedInstanceOfferings.addItem(new ReservedInstanceOfferingRepresenter(item));
			}
			dispatchEvent(new DescribeReservedInstancesOfferingsResultEvent(result));
		}
		
		private function purchaseOffering_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, purchaseOffering_resultHandler);
			dispatchEvent(new PurchaseReservedInstancesOfferingResultEvent(result));
		}
		
		private function describeSpotPriceHistory_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, describeSpotPriceHistory_resultHandler);
			spotPriceHistory = Helpers.resultToArrayCollection(result, SpotPrice);
			dispatchEvent(new DescribeSpotPriceHistoryResultEvent(result));
		}
		
		private function describeAvailabilityZones_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, describeAvailabilityZones_resultHandler);
			availabilityZones = Helpers.resultToArrayCollection(result);
		}
		
		/**********************
		 *   Fault Handlers
		 * ********************/
		
		private function createSecurityGroup_faultHandler(event:FaultEvent):void
		{
			removeEventListener(FaultEvent.FAULT, createSecurityGroup_faultHandler);
			dispatchEvent(new CreateSecurityGroupFaultEvent(event.fault));
		}
		
		private function authorizePortRange_faultHandler(event:FaultEvent):void
		{
			removeEventListener(FaultEvent.FAULT, authorizePortRange_faultHandler);
			dispatchEvent(new AuthorizePortRangeFaultEvent(event.fault));
		}
		
		private function revokePortRange_faultHandler(event:FaultEvent):void
		{
			removeEventListener(FaultEvent.FAULT, revokePortRange_faultHandler);
			dispatchEvent(new RevokePortRangeFaultEvent(event.fault));
		}
		
		private function getRoles_faultHandler(event:FaultEvent):void
		{
			removeEventListener(FaultEvent.FAULT, getRoles_faultHandler);
			dispatchEvent(new GetRolesFaultEvent(event.fault));
		}
		
		private function getRunList_faultHandler(event:FaultEvent):void
		{
			removeEventListener(FaultEvent.FAULT, getRunList_faultHandler);
			dispatchEvent(new GetRunListFaultEvent(event.fault));
		}	
		
		private function getEc2Resources_faultHandler(event:FaultEvent):void
		{
			removeEventListener(FaultEvent.FAULT, getEc2Resources_faultHandler);
			dispatchEvent(new GetResourcesFaultEvent(event.fault));
		}
		
		private function startInstance_faultHandler(event:FaultEvent):void
		{
			removeEventListener(FaultEvent.FAULT, startInstance_faultHandler);
			dispatchEvent(new StartInstanceFaultEvent(event.fault));
		}
		
		private function stopInstance_faultHandler(event:FaultEvent):void
		{
			removeEventListener(FaultEvent.FAULT, stopInstance_faultHandler);
			dispatchEvent(new StopInstanceFaultEvent(event.fault));
		}
		
		private function rebootInstance_faultHandler(event:FaultEvent):void
		{
			removeEventListener(FaultEvent.FAULT, rebootInstance_faultHandler);
			dispatchEvent(new RebootInstanceFaultEvent(event.fault));
		}
		
		private function getConsoleOutput_faultHandler(event:FaultEvent):void
		{
			removeEventListener(FaultEvent.FAULT, getConsoleOutput_faultHandler);
			dispatchEvent(new GetConsoleOutputFaultEvent(event.fault));
		}
		
		private function describeOfferings_faultHandler(event:FaultEvent):void
		{
			removeEventListener(FaultEvent.FAULT, describeOfferings_faultHandler);
			dispatchEvent(new ComputeServiceFaultEvent(event.fault));
		}
		
		private function default_faultHandler(event:FaultEvent):void
		{
			removeEventListener(FaultEvent.FAULT, default_faultHandler);
			dispatchEvent(new ComputeServiceFaultEvent(event.fault));
		}
	}
}
