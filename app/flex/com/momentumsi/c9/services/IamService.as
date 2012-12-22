package com.momentumsi.c9.services
{
	import flash.events.Event;
	
	import mx.collections.ArrayCollection;
	import mx.rpc.events.*;
	
	[Event(name="listUsersResult", type="mx.rpc.events.ResultEvent")]
	[Event(name="groupCreated", type="flash.events.Event")]
	[Event(name="userCreated", type="mx.rpc.events.ResultEvent")]
	
	[Bindable]
	public class IamService extends CloudApiService
	{
		/*************
		 * Event types
		 * ************/
		public static const LIST_USERS_RESULT:String = "listUsersResult";
		public static const GROUP_CREATED:String = "groupCreated";
		public static const USER_CREATED:String = "userCreated";
		
		public var users:ArrayCollection;
		public function IamService(rootURL:String=null, destination:String=null)
		{
			super(rootURL, destination);
			serviceType = IAM_SERVICE;
		}
		
		public function listUsers():void
		{	
			action = "list_users";
			addEventListener(ResultEvent.RESULT, listUsers_resultHandler);
			send();
		}
		
		public function createUser(parameters:Object):void
		{
			setPost();
			action = "create_user";
			request = parameters;
			addEventListener(ResultEvent.RESULT, createUser_resultHandler);
			send();
		}

		public function createGroup(parameters:Object):void
		{
			setPost();
			action = "create_group";
			request = parameters;
			addEventListener(ResultEvent.RESULT, createGroup_resultHandler);
			send();
		}
		/*********************
		 *  Result Handlers
		 * ******************/
		
		private function listUsers_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, listUsers_resultHandler);
			users = new ArrayCollection(result as Array);
			dispatchEvent(new ResultEvent(LIST_USERS_RESULT, false, true, users));
		}
		
		private function createGroup_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, createGroup_resultHandler);
			dispatchEvent(new Event(GROUP_CREATED));
		}
		
		private function createUser_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, createUser_resultHandler);
			dispatchEvent(new ResultEvent(USER_CREATED, false, true, result));
		}
			
		
		/*********************
		 *  Fault Handlers
		 * ******************/
		
		private function faultHandler(event:FaultEvent):void
		{
			
		}
	}
}