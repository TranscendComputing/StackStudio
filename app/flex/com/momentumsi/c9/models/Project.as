package com.momentumsi.c9.models
{
	import com.adobe.serialization.json.JSON;
	import com.momentumsi.c9.events.ProjectEvent;
	import com.momentumsi.c9.services.ProjectService;
	
	import flash.events.Event;
	import flash.events.EventDispatcher;
	import flash.events.TimerEvent;
	import flash.utils.Timer;
	
	import mx.collections.ArrayCollection;
	import mx.rpc.AsyncToken;
	import mx.rpc.CallResponder;
	import mx.rpc.events.ResultEvent;
	
	import spark.collections.Sort;
	import spark.collections.SortField;
	
	[Event(name="projectEvent", type="com.momentumsi.c9.events.ProjectEvent")]
	[Event(name="promoteEnvironmentResult", type="com.momentumsi.c9.events.project.PromoteEnvironmentResultEvent")]
	[Event(name="promoteEnvironmentFault", type="com.momentumsi.c9.events.project.PromoteEnvironmentFaultEvent")]
	[Bindable]
	public class Project extends EventDispatcher
	{
		public static const EMBEDDABLE:String = "embeddable";
		public static const STANDARD:String = "standard";
		public var project_id:String;
		public var project_name:String;
		public var owner:User = new User();
		public var cloud_account:CloudAccount = new CloudAccount();
		public var userRole:String;
		public var description:String;
		public var type:String;
		public var region:String;
		public var members:ArrayCollection = new ArrayCollection();
		public var group_projects:ArrayCollection = new ArrayCollection();
		public var versions:ArrayCollection = new ArrayCollection();
		public var provisionedVersions:ArrayCollection = new ArrayCollection();
		
		//Strings for selected version and selected environment
		//used for making calls to retrieve models below
		public var selectedVersion:String;
		public var selectedEnvironment:String;
		
		//Representations of version and provisioned version models
		public var currentVersion:ProjectVersion;
		public var currentProvisionedVersion:ProvisionedVersion;

		private var projectService:ProjectService = new ProjectService();
		
		private var delayActionTimer:Timer = new Timer(3000);
		
		public function Project()
		{
			projectService.project = this;
		}
		
		public static function buildProject(project:Object):Project
		{
			var p:Project = new Project();
			
			var responseCollection:ArrayCollection;
			var item:Object;	
			
			//Build collection of provisioned_versions
			responseCollection = new ArrayCollection(project.provisioned_versions as Array);
			for each(item in responseCollection)
			{
				p.provisionedVersions.addItem(ProvisionedVersion.buildProvisionedVersion(item.provisioned_version));
			}
			
			//Build collection of versions
			responseCollection = new ArrayCollection(project.versions as Array);	
			for each(item in responseCollection)	
			{
				p.versions.addItem(Version.buildVersion(item.version));
			}
			//Reverse versions list so most recent versions are at top of list
			p.versions.source.reverse();
			
			p.members = new ArrayCollection(project["members"]);
			for each(var mem:Object in p.members)
			{
				p.members.setItemAt(Member.buildMember(mem["member"]), p.members.getItemIndex(mem));
			}
			
			p.group_projects = new ArrayCollection(project["group_projects"]);
			for each(var gp:Object in p.group_projects)
			{
				p.group_projects.setItemAt(GroupProject.buildGroupProject(gp["group_project"]), p.group_projects.getItemIndex(gp));
			}
			
			var owner:User = new User();
			owner.login = project.owner["login"];
			owner.id = project.owner["id"];
			
			p.project_name = project["name"];
			p.project_id = project["id"];
			p.description = project["description"];
			p.type = project["project_type"];
			p.region = project["region"];
			p.owner = owner;
			p.cloud_account = CloudAccount.buildCloudAccount(project["cloud_account"]["cloud_account"]);
			p.projectService.projectId = p.project_id;
			return p;
				
		}
		
		public function update(project:Object):void
		{
			if(project == null)
			{
				return;
			}
			var proVersions:Array = project["provisioned_versions"] as Array;
			if(proVersions == null)
			{
				proVersions = [];
			}
			var index:int = 0;
			var provisionedVersion:ProvisionedVersion
			if(proVersions.length >= provisionedVersions.length)
			{
				for(index; index < proVersions.length; index++)
				{
					if(index < provisionedVersions.length)
					{
						provisionedVersion = provisionedVersions.getItemAt(index) as ProvisionedVersion;
						provisionedVersion.update(proVersions[index]["provisioned_version"]);
					}else{
						provisionedVersions.addItem(ProvisionedVersion.buildProvisionedVersion(proVersions[index]["provisioned_version"]));
					}
				}
			}else{
				for each(provisionedVersion in provisionedVersions)
				{
					index = provisionedVersions.getItemIndex(provisionedVersion);
					if(proVersions.length > index)
					{
						provisionedVersion.update(proVersions[index]["provisioned_version"]);
					}else{
						provisionedVersions.removeItemAt(index);
					}
				}
			}
			
			//Build collection of versions
			var versionsCollection:ArrayCollection = new ArrayCollection(project.versions as Array);
			versions.removeAll();
			for each(var item:Object in versionsCollection)
			{
				versions.addItem(Version.buildVersion(item.version));
			}
			//Reverse versions list so most recent versions are at top of list
			versions.source.reverse();
			
			members = new ArrayCollection(project["members"]);
			for each(var mem:Object in members)
			{
				members.setItemAt(Member.buildMember(mem["member"]), members.getItemIndex(mem));
			}
			
			group_projects = new ArrayCollection(project["group_projects"]);
			for each(var gp:Object in group_projects)
			{
				group_projects.setItemAt(GroupProject.buildGroupProject(gp["group_project"]), group_projects.getItemIndex(gp));
			}
			
			owner.login = project.owner["login"];
			owner.id = project.owner["id"];
			
			project_name = project["name"];
			project_id = project["id"];
			description = project["description"];
			type = project["project_type"];
			region = project["region"];
			if(project["cloud_account"] != null)
			{
				cloud_account.update(project["cloud_account"]["cloud_account"]);
			}
		}
				
		override public function toString():String
		{
			return this.project_name;
		}
		
		public function toObject():Object
		{
			return {project:{
					name: project_name, 
					description: description, 
					project_type: type, 
					region: region,
					cloud_account_id: cloud_account.id, 
					owner_id: owner.id}
			};
		}
		
		/**
		 * Project Actions
		 * */
		
		public function save():void
		{
			if(project_id == null)
			{
				projectService.createProject(this);
			}else{
				projectService.updateProject(this);
			}
		}
		
		public function get():void
		{
			projectService.getProject();
		}
		
		public function open(userId:String):void
		{
			projectService.openProject(userId);
		}

		public function createFromShallowCopy():void
		{
			if(currentVersion!= null)
			{
				projectService.addEventListener(ResultEvent.RESULT, shallowProjectCreate_resultHandler)
				projectService.createProject(this);
			}
		}
		
		private function shallowProjectCreate_resultHandler(event:ResultEvent):void
		{
			projectService.removeEventListener(ResultEvent.RESULT, shallowProjectCreate_resultHandler);
			project_id = projectService.result["project"]["id"];
			currentVersion.projectId = project_id;
			currentVersion.saveCollections();
		}
		
		public function getProjectVersion(version:String, environment:String=null):void
		{
			selectedVersion = version;
			selectedEnvironment = environment;
			projectService.getProjectVersion(version);
			addEventListener(ProjectEvent.VERSION_SET, getProvisionedVersion)
		}
		
		public function promoteEnvironment(version:String, environment:String):void
		{
			projectService.promoteEnvironment(version, environment);
		}
		
		private function getProvisionedVersion(event:ProjectEvent):void
		{
			for each(var pversion:ProvisionedVersion in provisionedVersions)
			{
				if(pversion.environment == selectedEnvironment && pversion.version == selectedVersion)
				{
					//Add delay timer to ensure call is made after other results have come in
					delayActionTimer.addEventListener(TimerEvent.TIMER, reallyGetProvisionedVersion);
					delayActionTimer.start();
					currentProvisionedVersion = pversion;
					return;
				}
			}
			
			//  If provisioned version not found above and returned, then set currentProvisionedVersion to null
			//  and dispatch event
			currentProvisionedVersion = null;
			dispatchEvent(new ProjectEvent(ProjectEvent.PROVISIONED_VERSION_SET, this));
		}
		
		private function reallyGetProvisionedVersion(event:TimerEvent):void
		{
			projectService.getProvisionedVersion(currentProvisionedVersion.id);
			delayActionTimer.stop();
		}
		
		public function freezeVersion(version:String, description:String):void
		{
			var versionRequest:Object = {version: {number: version, description: description}};
			projectService.freezeVersion(versionRequest, currentVersion.version);
			addEventListener(ProjectEvent.VERSION_SET, projectUpdated);
		}
		
		public function createVariant(variant:ProjectVariant):void
		{
			projectService.createVariant(variant);
		}
		
		public function createProvisionedStack(version:String, environment:String):void
		{
			var stackName:String = project_name + environment + version.replace(/./g, "");
			projectService.createProvisionedVersion(project_name, version, environment);
			projectService.addEventListener(ProvisionedVersion.INSTANCES_UPDATED, updatedProvisionedInstances);
		}
		
		/**
		 * Result handlers
		 * */
		
		private function projectUpdated(event:ProjectEvent):void
		{
			removeEventListener(ProjectEvent.VERSION_SET, projectUpdated);
			dispatchEvent(new ProjectEvent(ProjectEvent.PROJECT_RESULT, event.project));
		}
		
		private function updatedProvisionedInstances(event:Event):void
		{
			dispatchEvent(new Event(ProvisionedVersion.INSTANCES_UPDATED));
		}
		
		public function getProjectParameters():ArrayCollection
		{
			var parameters:ArrayCollection = new ArrayCollection();
			var parameter:Parameter;
			for each(var element:* in currentVersion.elements)
			{
				if(element.elementType == "Parameter")
				{
					parameter = new Parameter();
					parameter.properties = element.properties;
					parameter.name = element.name;
					parameters.addItem(parameter);
				}
			}
			return parameters;
		}
		
		public function get mostRecentVersion():String
		{
			if(versions.length > 0)
			{	
				var version:Version = versions.getItemAt(versions[0]) as Version;
				return version.number;
			}else
			{
				return null;
			}
		}
		
		public function getMemberGroupAccessors(environment:String):ArrayCollection
		{
			var accessors:ArrayCollection = new ArrayCollection();
			
			//Find all members with access to environment
			for each(var member:Member in members)
			{
				if(member.hasEnvironmentAccess(environment))
				{
					accessors.addItem(member);
				}
			}
			
			//Find all groups with access to environment
			for each(var group:GroupProject in group_projects)
			{
				if(group.hasEnvironmentAccess(environment))
				{
					accessors.addItem(group);
				}
			}
			
			return accessors;
		}
		
		public function userHasPermission(userId:String, permissionName:String, permissionEnvironment:String):Boolean
		{
			var permission:Boolean = false;
			//Search if user has permission by member
			var member:Member = findUserAsMember(userId);
			if(member!=null && member.hasPermission(permissionName, permissionEnvironment))
			{
				permission = true;
			}
			
			//If user does not have permission directly, check if one of the groups gives permission
			if(!permission)
			{
				var groupProjects:Array = findUserGroupProjects(userId);
				for each(var gp:GroupProject in groupProjects)
				{
					if(gp.hasPermission(permissionName, permissionEnvironment))
					{
						permission = true;
					}
				}
			}
			
			return permission;
		}
		
		public function userIsProjectAdmin(userId:String):Boolean
		{
			var adminRights:Boolean = false;
			//Search if user has admin by member
			var member:Member = findUserAsMember(userId);
			if(member!=null && member.isProjectAdmin())
			{
				adminRights = true;
			}
			
			//If user does not have admin directly, check if one of the groups gives admin
			if(!adminRights)
			{
				var groupProjects:Array = findUserGroupProjects(userId);
				for each(var gp:GroupProject in groupProjects)
				{
					if(gp.isProjectAdmin())
					{
						adminRights = true;
					}
				}
			}
			
			return adminRights;
		}
		
		public function findUserAsMember(userId:String):Member
		{
			var member:Member;
			var found:Boolean = false;
			for each(var m:Member in members)
			{
				if(!found && userId == m.account.id)
				{
					found = true;
					member = m;
				}
			}
			return member;
		}
		
		private function findUserGroupProjects(userId:String):Array
		{
			var groups:Array = new Array();
			for each(var gp:GroupProject in group_projects)
			{
				if(gp.group.hasUser(userId))
				{
					groups.push(gp);
				}
			}
			return groups;
		}
		
		public function hasGroup(groupId:String):Boolean
		{
			var found:Boolean = false;
			for each(var gp:GroupProject in group_projects)
			{
				if(gp.group.id == groupId)
				{
					found = true;
				}
			}
			return found;
		}
		
		public function addNewMember(member:Member):void
		{
			projectService.addNewMember(member);
		}
		
		public function deleteMember(memberId:String):void
		{
			projectService.deleteMember(memberId);
		}
		
		public function addMemberPermission(memberId:String, permission:Permission):void
		{
			projectService.addMemberPermission(memberId, permission);
		}
		
		public function removeMemberPermission(memberId:String, permissionId:String):void
		{
			projectService.removeMemberPermission(memberId, permissionId);
		}
		
		public function addMemberPermissionBulk(memberId:String, permissions:Object):void
		{
			projectService.addMemberPermissionBulk(memberId, permissions);
		}
		
		public function removeMemberPermissionsByEnv(memberId:String, environment:String):void
		{
			projectService.removeMemberPermissionsByEnv(memberId, environment);
		}
		
		public function addNewGroup(groupId:String):void
		{
			projectService.addNewGroup(groupId);
		}
		
		public function removeGroup(groupId:String):void
		{
			projectService.removeGroup(groupId);
		}
		
		public function addGroupPermission(groupId:String, permission:Permission):void
		{
			projectService.addGroupPermission(groupId, permission);
		}
		
		public function removeGroupPermission(groupId:String, permissionId:String):void
		{
			projectService.removeGroupPermission(groupId, permissionId);
		}
		
		public function addGroupPermissionBulk(groupId:String, permissions:Object):void
		{
			projectService.addGroupPermissionBulk(groupId, permissions);
		}
		
		public function removeGroupPermissionsByEnv(groupId:String, environment:String):void
		{
			projectService.removeGroupPermissionsByEnv(groupId, environment);
		}
	}
}
