package com.momentumsi.c9.services
{
	import com.momentumsi.c9.constants.ResourceType;
	import com.momentumsi.c9.events.cache.*;
	import com.momentumsi.c9.representers.ComputeSecurityGroupRepresenter;
	
	import flash.events.Event;
	import flash.net.URLRequest;
	import flash.net.URLRequestMethod;
	
	import mx.collections.ArrayCollection;
	import mx.events.FlexEvent;
	import mx.rpc.events.FaultEvent;
	import mx.rpc.events.ResultEvent;

	[Event(name="resourceComplete", type="mx.events.FlexEvent")]
	[Event(name="cacheSecurityGroupCreated", type="flash.events.Event")]
	[Event(name="cacheSecGroupError", type="flash.events.Event")]
	[Event(name="cacheParamGroupModified", type="flash.events.Event")]
	[Event(name="deleteCacheSecurityGroupResult", type="com.momentumsi.c9.events.cache.DeleteCacheSecurityGroupResultEvent")]
	[Event(name="deleteCacheSecurityGroupFault", type="com.momentumsi.c9.events.cache.DeleteCacheSecurityGroupFaultEvent")]
	[Event(name="authorizeCacheSecurityGroupIngressResult", type="com.momentumsi.c9.events.cache.AuthorizeCacheSecurityGroupIngressResultEvent")]
	[Event(name="authorizeCacheSecurityGroupIngressFault", type="com.momentumsi.c9.events.cache.AuthorizeCacheSecurityGroupIngressFaultEvent")]
	[Event(name="revokeCacheSecurityGroupIngressResult", type="com.momentumsi.c9.events.cache.RevokeCacheSecurityGroupIngressResultEvent")]
	[Event(name="revokeCacheSecurityGroupIngressFault", type="com.momentumsi.c9.events.cache.RevokeCacheSecurityGroupIngressFaultEvent")]
	[Event(name="describeCacheSecurityGroupsResult", type="com.momentumsi.c9.events.cache.DescribeCacheSecurityGroupsResultEvent")]
	[Event(name="describeCacheSecurityGroupsFault", type="com.momentumsi.c9.events.cache.DescribeCacheSecurityGroupsFaultEvent")]
	[Event(name="createCacheSecurityGroupResult", type="com.momentumsi.c9.events.cache.CreateCacheSecurityGroupResultEvent")]
	[Event(name="createCacheSecurityGroupFault", type="com.momentumsi.c9.events.cache.CreateCacheSecurityGroupFaultEvent")]
	
	[Bindable]
	public class ElcService extends CloudApiService
	{		
		public static const CACHE_PARAM_GROUP_MODIFIED:String = "cacheParamGroupModified";
		
		//Actions
		public static const CREATE_CLUSTER:String = "create_cache_cluster";
		public static const DELETE_SECURITY_GROUP:String = "delete_cache_security_group";
		public static const AUTHORIZE_INGRESS:String = "authorize_cache_security_group_ingress";
		public static const REVOKE_INGRESS:String = "revoke_cache_security_group_ingress";
		public static const DESCRIBE_SECURITY_GROUPS:String = "describe_cache_security_groups";
		public static const CREATE_SECURITY_GROUP:String = "create_cache_security_group";
		
		/***********************
		 * 	Cluster Resources
		 * *********************/
		public var parameterGroups:ArrayCollection = new ArrayCollection([{name: "default"}]);
		public var securityGroups:ArrayCollection = new ArrayCollection([{name: "default"}]);
		public var prices:ArrayCollection = new ArrayCollection();
		public var events:ArrayCollection = new ArrayCollection();
		
		public function ElcService(rootURL:String=null, destination:String=null)
		{
			super(rootURL, destination);
			serviceType = CACHE_SERVICE;
		}
		
		/****************
		 * 	ELC API Actions
		 * **************/
		
		public function getElcResources():void
		{
			method = URLRequestMethod.GET;
			action = "get_elc_resources";
			addEventListener(ResultEvent.RESULT, getElcResources_resultHandler);
			send();
		}
				
		public function createCluster(name:String, properties:Object):void
		{
			setPost();
			action = CREATE_CLUSTER;
			request = new Object();
			request["name"] = name;
			request["Properties"] = properties;
			send();
		}
		
		public function createCacheParameterGroup(name:String, description:String, family:String):void
		{
			setPost();
			action = "create_cache_parameter_group";
			request = {name: name, desctiption: description, family: family};
			send();
		}
		
		public function createCacheSecurityGroup(groupName:String, description:String):void
		{
			setPost();
			action = CREATE_SECURITY_GROUP;
			request = {
				group_name: groupName,
				description: description
			};
			addEventListener(ResultEvent.RESULT, createCacheSecurityGroup_resultHandler);
			addEventListener(FaultEvent.FAULT, createCacheSecurityGroup_faultHandler);
			send();
		}
		
		public function describeEvents(clusterName:String = null):void
		{
			method = URLRequestMethod.GET;
			action = "describe_cache_events";
			addEventListener(ResultEvent.RESULT, describeEvents_resultHandler);
			send({cluster_name: clusterName});
		}
		
		public function modifyCacheParameterGroup(groupName:String, parameters:Array):void
		{
			setPost();
			action = "modify_cache_parameter_group";
			addEventListener(ResultEvent.RESULT, modifyCacheParameterGroup_resultHandler);
			request = {group_name: groupName, group_parameters: parameters};
			send();
		}
		
		public function deleteSecurityGroup(name:String):void
		{
			setPost();
			action = DELETE_SECURITY_GROUP;
			addEventListener(ResultEvent.RESULT, deleteSecurityGroup_resultHandler);
			addEventListener(FaultEvent.FAULT, deleteSecurityGroup_faultHandler);
			request = {name: name};
			send();
		}
		
		public function authorizeIngress(name:String, computeGroup:ComputeSecurityGroupRepresenter):void
		{
			setPost();
			action = AUTHORIZE_INGRESS;
			addEventListener(ResultEvent.RESULT, authorizeIngress_resultHandler);
			addEventListener(FaultEvent.FAULT, authorizeIngress_faultHandler);
			request = {name:name, group_name: computeGroup.name, group_owner: computeGroup.ownerId};
			send();
		}
		
		public function revokeIngress(name:String, computeGroup:ComputeSecurityGroupRepresenter):void
		{
			setPost();
			action = REVOKE_INGRESS;
			addEventListener(ResultEvent.RESULT, revokeIngress_resultHandler);
			addEventListener(FaultEvent.FAULT, revokeIngress_faultHandler);
			request = {name: name, group_name: computeGroup.name, group_owner: computeGroup.ownerId};
			send();
		}
		
		public function describeCacheSecurityGroups(name:String=null):void
		{
			method = URLRequestMethod.GET;
			action = DESCRIBE_SECURITY_GROUPS;
			addEventListener(ResultEvent.RESULT, describeCacheSecurityGroups_resultHandler);
			addEventListener(FaultEvent.FAULT, describeCacheSecurityGroups_faultHandler);
			send({physical_id: name});
		}
	
		/****************
		 * 	ELC Result Handlers
		 * **************/
		
		private function getElcResources_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, getElcResources_resultHandler);
			if(result["parameter_groups"] != null)
			{
				parameterGroups = new ArrayCollection(result["parameter_groups"] as Array);
			}
			if(result["security_groups"] != null)
			{
				securityGroups = new ArrayCollection(result["security_groups"] as Array);
			}
			prices = new ArrayCollection(result["prices"] as Array);
			dispatchEvent(new FlexEvent("resourceComplete", false, true));
		}
		
		
		private function describeEvents_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, describeEvents_resultHandler);
			events = new ArrayCollection(result as Array);
		}
		
		private function createCacheSecurityGroup_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, createCacheSecurityGroup_resultHandler);
			dispatchEvent(new CreateCacheSecurityGroupResultEvent(result));
		}
		
		private function modifyCacheParameterGroup_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, modifyCacheParameterGroup_resultHandler);
			dispatchEvent(new Event(CACHE_PARAM_GROUP_MODIFIED));
		}
		
		private function deleteSecurityGroup_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, deleteSecurityGroup_resultHandler);
			dispatchEvent(new DeleteCacheSecurityGroupResultEvent(result));
		}
		
		private function authorizeIngress_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, authorizeIngress_resultHandler);
			dispatchEvent(new AuthorizeCacheSecurityGroupIngressResultEvent(result));
		}
		
		private function revokeIngress_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, revokeIngress_resultHandler);
			dispatchEvent(new RevokeCacheSecurityGroupIngressResultEvent(result));
		}
		
		private function describeCacheSecurityGroups_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, describeCacheSecurityGroups_resultHandler);
			dispatchEvent(new DescribeCacheSecurityGroupsResultEvent(result));
		}
		
		
		
		/**********************
		 *   Fault Handlers
		 * ********************/
		
		private function createCacheSecurityGroup_faultHandler(event:FaultEvent):void
		{
			removeEventListener(FaultEvent.FAULT, createCacheSecurityGroup_faultHandler);
			dispatchEvent(new CreateCacheSecurityGroupFaultEvent(event.fault));
		}
		
		private function deleteSecurityGroup_faultHandler(event:FaultEvent):void
		{
			removeEventListener(FaultEvent.FAULT, deleteSecurityGroup_faultHandler);
			dispatchEvent(new DeleteCacheSecurityGroupFaultEvent(event.fault));
		}
		
		private function authorizeIngress_faultHandler(event:FaultEvent):void
		{
			removeEventListener(FaultEvent.FAULT, authorizeIngress_faultHandler);
			dispatchEvent(new AuthorizeCacheSecurityGroupIngressFaultEvent(event.fault));
		}
		
		private function revokeIngress_faultHandler(event:FaultEvent):void
		{
			removeEventListener(FaultEvent.FAULT, revokeIngress_faultHandler);
			dispatchEvent(new RevokeCacheSecurityGroupIngressFaultEvent(event.fault));
		}
		
		private function describeCacheSecurityGroups_faultHandler(event:FaultEvent):void
		{
			removeEventListener(FaultEvent.FAULT, describeCacheSecurityGroups_faultHandler);
			dispatchEvent(new DescribeCacheSecurityGroupsFaultEvent(event.fault));
		}
	}
}
