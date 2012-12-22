package com.momentumsi.c9.models
{
	import com.momentumsi.c9.services.IdentityService;
	
	import flash.events.Event;
	import flash.events.EventDispatcher;
	
	import mx.collections.ArrayCollection;
	import mx.rpc.events.ResultEvent;

	[Event(name="cloudAccountsUpdated", type="flash.events.Event")]
	[Bindable]
	public class User extends EventDispatcher
	{
		public static const CLOUD_ACCOUNTS_UPDATED:String = "cloudAccountsUpdated";
		
		//API Identity
		public var id:String;
		public var org_id:String;
		//Required for new user
		public var login:String;
		public var email:String;
		public var firstName:String;
		public var lastName:String;
		public var company:String;
		public var termsOfService:Boolean;
		public var password:String;
		public var passwordConfirmation:String;
		public var country_code:String;
				
		public var permissions:ArrayCollection;
		public var subscriptions:ArrayCollection;
		public var cloud_accounts:ArrayCollection;
		public var project_memberships:ArrayCollection;
		private var identityService:IdentityService;
		
		public function User(login:String=null, id:String=null, org_id:String=null, firstName:String = null, lastName:String=null, email:String=null, permissions:ArrayCollection=null, subscriptions:ArrayCollection=null, cloudAccounts:ArrayCollection=null, projectMemberships:ArrayCollection=null)
		{
			this.login = login;
			this.id = id;
			this.org_id = org_id;
			this.firstName = firstName;
			this.lastName = lastName;
			this.email = email;
			this.permissions = permissions;
			this.subscriptions = subscriptions;
			this.cloud_accounts = cloudAccounts;
			this.project_memberships = projectMemberships;
		}
		
		public static function buildUser(user:Object):User
		{
			var u:User;
			if(user != null)
			{
				var index:int;
				
				var p:Project;
				var m:Member;
				var perm:Permission;
				var userMemberships:Array = user["project_memberships"];
				var memberships:ArrayCollection = new ArrayCollection();			
				if (userMemberships != null){
					for(index=0; index < userMemberships.length; index++){
						p = new Project();
						p.project_id = user["project_memberships"][index]["membership"]["project_id"];
						p.project_name = user["project_memberships"][index]["membership"]["project_name"];
						p.userRole = user["project_memberships"][index]["membership"]["role"];
						m = new Member();
						m.id = user["project_memberships"][index]["membership"]["member_id"];
						m.role = user["project_memberships"][index]["membership"]["role"];
						m.account = new User(user["login"], user["id"], user["org_id"], user["first_name"], user["last_name"], user["email"], null, null, null, null);
						m.permissions = new ArrayCollection();
						var memberPermissions:Array = user["project_memberships"][index]["membership"]["member_permissions"];
						if(memberPermissions != null)
						{
							for(var i:int = 0; i < memberPermissions.length; i++)
							{
								perm = new Permission();
								perm.id = user["project_memberships"][index]["membership"]["member_permissions"][i]["_id"];
								perm.name = user["project_memberships"][index]["membership"]["member_permissions"][i]["name"];
								perm.environment = user["project_memberships"][index]["membership"]["member_permissions"][i]["environment"];
								m.permissions.addItem(perm);
							}
						}
						p.members.addItem(m);
						memberships.addItem(p);
					}
				}
				
				var userPermissions:Array = user["permissions"];
				var permissions:ArrayCollection = new ArrayCollection();
				if(userPermissions != null)
				{
					for(index = 0; index < userPermissions.length; index ++)
					{
						perm = new Permission();
						perm.id = user["permissions"][index]["permission"]["id"];
						perm.name = user["permissions"][index]["permission"]["name"];
						perm.environment = user["permissions"][index]["permission"]["environment"];
						permissions.addItem(perm);
					}
				}
				
				var s:Subscription;
				var userSubscriptions:Array = user["subscriptions"];			
				var subs:ArrayCollection = new ArrayCollection();
				if(userSubscriptions != null){
					for(index=0; index < userSubscriptions.length; index++){
						s = Subscription.buildSubscription(user["subscriptions"][index]["subscription"]);
						subs.addItem(s);
					}
				}
				
				var acct:CloudAccount;
				var userCloudAccounts:Array = user["cloud_accounts"];
				var accts:ArrayCollection = new ArrayCollection();
				if(userCloudAccounts != null){
					for(index=0; index < userCloudAccounts.length; index++){
						acct = CloudAccount.buildCloudAccount(user["cloud_accounts"][index]["cloud_account"]);
						accts.addItem(acct);
					}
				}
				
				u = new User(user["login"], user["id"], user["org_id"], user["first_name"], user["last_name"], user["email"], permissions, subs, accts, memberships);
			}
			return u;
		}
		
		public function update(user:Object):void
		{
			var index:int;
			
			var acct:CloudAccount;
			var userCloudAccounts:ArrayCollection = new ArrayCollection(user["cloud_accounts"] as Array);

			cloud_accounts.removeAll();
			for each(var a:Object in userCloudAccounts)
			{
				cloud_accounts.addItem(CloudAccount.buildCloudAccount(a["cloud_account"]));
			}
			dispatchEvent(new Event(CLOUD_ACCOUNTS_UPDATED));
		}
		
		override public function toString():String
		{
			return this.login;
		}
		
		public function toObject():Object
		{
			return {account: {login: login, org_id: org_id, first_name: firstName, last_name: lastName, company: company, terms_of_service: termsOfService, email: email, password: password, password_confirmation: passwordConfirmation, country_code: country_code}};
		}
		
		public function create():void
		{
			identityService = new IdentityService();
			identityService.user = this;
			identityService.addEventListener(ResultEvent.RESULT, createUser_resultHandler);
			identityService.createNewUserAccount();
		}
		
		private function createUser_resultHandler(event:ResultEvent):void
		{
			dispatchEvent(new ResultEvent(ResultEvent.RESULT, false, true, identityService.result));
		}
		
		public function findProjectByName(name:String):Project
		{
			var project:Project = null;
			for each(var proj:* in project_memberships)
			{
				if(proj.project_name == name)
				{
					project = new Project();
					project.project_id = proj.project_id;
				}
			}
			return project;
		}
		
		public function updateUser():void
		{
			identityService = new IdentityService();
			identityService.user = this;
			identityService.updateUser();
		}
		
		public function hasPermission(name:String, environment:String):Boolean
		{
			var found:Boolean = false;
			if(permissions != null)
			{
				for each(var p:Permission in permissions)
				{
					if(p.name == name && p.environment == environment)
					{
						found = true;
					}
				}
			}
			return found;
		}
	}
}