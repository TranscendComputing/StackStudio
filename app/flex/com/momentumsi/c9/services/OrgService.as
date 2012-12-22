package com.momentumsi.c9.services
{
	import com.maccherone.json.JSON;
	import com.momentumsi.c9.events.org.GetOrgDetailsResultEvent;
	import com.momentumsi.c9.models.CloudMapping;
	import com.momentumsi.c9.models.Group;
	
	import mx.collections.ArrayCollection;
	import mx.rpc.events.FaultEvent;
	import mx.rpc.events.ResultEvent;

	[Event(name="getOrgDetailsResult", type="com.momentumsi.c9.events.org.GetOrgDetailsResultEvent")]
	
	[Bindable]
	public class OrgService extends ApiService
	{		
		public var apiHost:String;
		public var orgUrl:String;
		
		public function OrgService(rootURL:String=null, destination:String=null)
		{
			super(rootURL, destination);
			apiHost = url;
			orgUrl = url + "/identity/v1/orgs";
		}
		
		public function getOrgDetails(orgId:String):void
		{
			var timeStampForNoCache:Date = new Date();
			method = "GET";
			url = orgUrl + "/" + orgId + ".json?" + timeStampForNoCache.toString().replace(/\s/g);
			addEventListener(ResultEvent.RESULT, updateOrg_resultHandler);
			send();
		}
		
		public function createGroup(orgId:String, group:Group):void
		{
			setPost();
			url = orgUrl + "/" + orgId + "/groups";
			request = group.toObject();
			send();
		}
		
		public function deleteGroup(orgId:String, groupId:String):void
		{
			setPost();
			url = orgUrl + "/" + orgId + "/groups/" + groupId + "?_method=DELETE";
			send();
		}
		
		public function addUserToGroup(orgId:String, groupId:String, accountId:String):void
		{
			setPost();
			url = orgUrl + "/" + orgId + "/groups/" + groupId + "/accounts/" + accountId;
			send();
		}
		
		public function removeUserFromGroup(orgId:String, groupId:String, accountId:String):void
		{
			setPost();
			url = orgUrl + "/" + orgId + "/groups/" + groupId + "/accounts/" + accountId + "?_method=DELETE";
			send();
		}
		
		public function createOrgMapping(orgId:String, mapping:CloudMapping):void
		{
			setPost();
			url = orgUrl + "/" + orgId + "/mappings";
			request = mapping.toObject();
			addEventListener(ResultEvent.RESULT, updateOrg_resultHandler);
			send();
		}
		
		public function editOrgMapping(orgId:String, mapping:CloudMapping):void
		{
			setPost();
			url = orgUrl + "/" + orgId + "/mappings/" + mapping.id + "?_method=PUT";
			request = mapping.toObject();
			addEventListener(ResultEvent.RESULT, updateOrg_resultHandler);
			addEventListener(FaultEvent.FAULT, default_faultHandler);
			send();
		}
		
		//----------------
		//result handlers
		//----------------
		
		private function updateOrg_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, updateOrg_resultHandler);
			dispatchEvent(new GetOrgDetailsResultEvent(result));
		}
		
		//----------------
		//fault handlers
		//----------------
		
		private function default_faultHandler(event:FaultEvent):void
		{
			removeEventListener(FaultEvent.FAULT, default_faultHandler);
		}
	}
}