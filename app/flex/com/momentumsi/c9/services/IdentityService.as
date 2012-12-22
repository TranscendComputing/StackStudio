package com.momentumsi.c9.services
{
	import com.maccherone.json.JSON;
	import com.momentumsi.c9.constants.AlertMessage;
	import com.momentumsi.c9.events.apiIdentity.*;
	import com.momentumsi.c9.models.CloudAccount;
	import com.momentumsi.c9.models.Permission;
	import com.momentumsi.c9.models.User;
	
	import flash.display.Loader;
	import flash.events.Event;
	import flash.events.IOErrorEvent;
	import flash.net.URLLoader;
	import flash.net.URLRequest;
	import flash.net.URLRequestHeader;
	import flash.net.URLRequestMethod;
	import flash.system.LoaderContext;
	
	import mx.collections.ArrayCollection;
	import mx.controls.Alert;
	import mx.core.FlexGlobals;
	import mx.rpc.events.AbstractEvent;
	import mx.rpc.events.FaultEvent;
	import mx.rpc.events.ResultEvent;
	import mx.rpc.http.mxml.HTTPService;
	import mx.utils.LoaderUtil;

	[Event(name="createCloudAccountResult", type="com.momentumsi.c9.events.apiIdentity.CreateCloudAccountResultEvent")]
	[Event(name="createCloudAccountFault", type="com.momentumsi.c9.events.apiIdentity.CreateCloudAccountFaultEvent")]
	[Event(name="deleteCloudAccountResult", type="com.momentumsi.c9.events.apiIdentity.DeleteCloudAccountResultEvent")]
	[Event(name="deleteCloudAccountFault", type="com.momentumsi.c9.events.apiIdentity.DeleteCloudAccountFaultEvent")]
	[Event(name="updateCloudAccountResult", type="com.momentumsi.c9.events.apiIdentity.UpdateCloudAccountResultEvent")]
	[Event(name="updateCloudAccountFault", type="com.momentumsi.c9.events.apiIdentity.UpdateCloudAccountFaultEvent")]
	
	[Bindable]
	public class IdentityService extends ApiService
	{		
		public var user:User;
		public var identityUrl:String;
		public var apiHost:String;
		public var countries:ArrayCollection;
		private var account:CloudAccount;
		private var userId:String;
		
		//Old keys used for updating/deleting topstack account
		public var oldAccessKey:String;
		public var oldSecretKey:String;
		
		public function IdentityService(rootURL:String=null, destination:String=null)
		{
			super(rootURL, destination);
			apiHost = url;
			identityUrl = url + "/identity/v1/accounts";
		}
		
		// Identity API Actions
		public function createNewCloudAccount(userId:String, account:CloudAccount):void
		{
			var service:CloudApiService = new CloudApiService();
			service.cloudAccountId = account.id;
			service.action = "create_cloud_account";
			service.setPost();
			service.request = {
				old_access_key: oldAccessKey,
				old_secret_key: oldSecretKey,
				account: account.toObject(),
				cloud_id: account.cloud_id
			};
			service.addEventListener(ResultEvent.RESULT, createCloudAccount_resultHandler);
			service.addEventListener(FaultEvent.FAULT, createCloudAccount_faultHandler);
			service.send();
		}
		
		public function updateCloudAccount(userId:String, account:CloudAccount):void
		{
			var service:CloudApiService = new CloudApiService();
			service.cloudAccountId = account.id;
			service.action = "update_cloud_account";
			service.setPost();
			service.request = {
				old_access_key: oldAccessKey,
				old_secret_key: oldSecretKey,
				account: account.toObject(),
				cloud_id: account.cloud_id
			};
			service.addEventListener(ResultEvent.RESULT, updateCloudAccount_resultHandler);
			service.addEventListener(FaultEvent.FAULT, updateCloudAccount_faultHandler);
			service.send();
		}
		
		public function deleteCloudAccount(userId:String, account:CloudAccount):void
		{
			var service:CloudApiService = new CloudApiService();
			service.cloudAccountId = account.id;
			service.action = "delete_cloud_account";
			service.setPost();
			service.request = {
				old_access_key: oldAccessKey,
				old_secret_key: oldSecretKey,
				account_id: account.id,
				cloud_id: account.cloud_id
			};
			service.addEventListener(ResultEvent.RESULT, deleteCloudAccount_resultHandler);
			service.addEventListener(FaultEvent.FAULT, deleteCloudAccount_faultHandler);
			service.send();
		}
		
		public function createNewUserAccount():void
		{
			setPost();
			url = identityUrl;
			var newUser:Object = user.toObject();
			request = newUser;
			send();
		}
		
		public function deleteUserAccount(userId:String):void
		{
			setPost();
			url = identityUrl + "/" + userId + "?_method=DELETE";
			send();
		}
		
		public function addNewPermission(userId:String, permission:Permission):void
		{
			setPost();
			url = identityUrl + "/" + userId + "/permissions";
			request = permission.toObject();
			send();
		}
		
		public function removePermission(userId:String, permissionId:String):void
		{
			setPost();
			url = identityUrl + "/" + userId + "/permissions" + permissionId + "?_method=DELETE";
			send();
		}
		
		public function login(id:String, password:String):void
		{
			//setPost();
			contentType = CONTENT_TYPE_FORM;
			method = "POST";
			url = url + "/identity/v1/accounts/auth";
			request = {login: id, password: password};
			addEventListener(FaultEvent.FAULT, login_faultHandler);
			send();
		}
		
		public function getAccountDetails(id:String):void
		{
			url = apiHost + "/stackplace/v1/accounts/" + id + ".json";
			send();
		}
		
		public function getCountries():void
		{
			url = identityUrl + "/countries.json";
			contentType = "application/json";
		    addEventListener(ResultEvent.RESULT, getCountries_resultHandler);
			send();
		}
		
		public function updateUser():void
		{
			var timeStamp:Date = new Date();
			url = identityUrl + "/" + user.id + ".json?nocachetime=" + timeStamp.toString();
			method = URLRequestMethod.GET;
			contentType = CONTENT_TYPE_JSON;
			addEventListener(ResultEvent.RESULT, updateUser_resultHandler);
			send();
		}
				
		/******
		 * Result Handlers
		 * */
		
		private function getCountries_resultHandler(event:ResultEvent):void
		{
			countries = new ArrayCollection(result["countries"] as Array);
		}
		
		private function updateUser_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, updateUser_resultHandler);
			user.update(result["account"]);
		}
		
		private function deleteCloudAccount_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, deleteCloudAccount_resultHandler);
			result = JSON.decode(event.result.toString());
			user.update(result["account"]);
			dispatchEvent(new DeleteCloudAccountResultEvent(result));
		}
		
		private function createCloudAccount_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, createCloudAccount_resultHandler);
			result = JSON.decode(event.result.toString());
			dispatchEvent(new CreateCloudAccountResultEvent(result));
		}
		
		private function updateCloudAccount_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, updateCloudAccount_resultHandler);
			result = JSON.decode(event.result.toString());
			dispatchEvent(new UpdateCloudAccountResultEvent(result));
		}
		
		/******
		 * Fault Handlers
		 * */
		
		private function createCloudAccount_faultHandler(event:FaultEvent):void
		{
			removeEventListener(FaultEvent.FAULT, createCloudAccount_faultHandler);
			dispatchEvent(new CreateCloudAccountFaultEvent(event.fault));
		}
		
		private function deleteCloudAccount_faultHandler(event:FaultEvent):void
		{
			removeEventListener(FaultEvent.FAULT, deleteCloudAccount_faultHandler);
			dispatchEvent(new DeleteCloudAccountFaultEvent(event.fault));
		}
		
		private function updateCloudAccount_faultHandler(event:FaultEvent):void
		{
			removeEventListener(FaultEvent.FAULT, updateCloudAccount_faultHandler);
			dispatchEvent(new UpdateCloudAccountFaultEvent(event.fault));
		}
		
		private function login_faultHandler(event:FaultEvent):void
		{
			var error:String = event.fault.content.toString();
			if(error == "")
			{
				switch(event.statusCode)
				{
					case 401:
						Alert.show(AlertMessage.LOGIN_401);
						break;
					case 400:
						Alert.show(AlertMessage.LOGIN_400);
						break;
					default:
						Alert.show(AlertMessage.LOGIN_DEFAULT);
				}
			}else
			{
				var errorArray:Array = error.split("message\":\"");
				if(errorArray.length > 1)
				{
					var errorDelimited:String = errorArray[1];
					errorArray = errorDelimited.split("\"");
					errorDelimited = errorArray[0];
					Alert.show(errorDelimited);
				}
			}
		}
	}
}