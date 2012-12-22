package com.momentumsi.c9.services
{
	import com.momentumsi.c9.constants.AlertMessage;
	import com.momentumsi.c9.constants.ResourceType;
	import com.momentumsi.c9.events.ProjectEvent;
	import com.momentumsi.c9.events.project.PromoteEnvironmentFaultEvent;
	import com.momentumsi.c9.events.project.PromoteEnvironmentResultEvent;
	import com.momentumsi.c9.models.Element;
	import com.momentumsi.c9.models.Environment;
	import com.momentumsi.c9.models.Member;
	import com.momentumsi.c9.models.Node;
	import com.momentumsi.c9.models.Permission;
	import com.momentumsi.c9.models.Project;
	import com.momentumsi.c9.models.ProjectVariant;
	import com.momentumsi.c9.models.ProjectVersion;
	import com.momentumsi.c9.models.ProvisionedVersion;
	import com.momentumsi.c9.serializers.JSONSerializationFilter;
	
	import flash.events.Event;
	import flash.net.URLRequestMethod;
	
	import mx.collections.ArrayCollection;
	import mx.collections.ArrayList;
	import mx.controls.Alert;
	import mx.core.FlexGlobals;
	import mx.rpc.AsyncToken;
	import mx.rpc.events.FaultEvent;
	import mx.rpc.events.ResultEvent;
	
	[Event(name="projectResult", type="com.momentumsi.c9.events.ProjectEvent")]
	[Bindable]
	public class ProjectService extends ApiService
	{
		public var projectId:String;
		public var projectsCollection:ArrayCollection;
		public var project:Project;
		
		private var projectUrl:String;
		private var host:String;
		
		public var templateResources:Object;
		public var elementsArray:Array;
		
		//Used to load new version into diagrammer
		private var newVersionNumber:String;
		
		public function ProjectService(rootURL:String=null, destination:String=null)
		{
			super(rootURL, destination);
			host = this.url;
			projectUrl = this.url + "/stackstudio/v1/projects";
		}
		
		// API actions
		public function projectQuery():void
		{
			send();
		}
		
		public function createProject(newProject:Project):void
		{
			setPost();
			url = projectUrl + "/";
			project = newProject;
			project.project_name = project.project_name.replace(/\s/g, "");
			project.project_name = project.project_name.replace(/\./g, "");
			request = project.toObject();
			addEventListener(ResultEvent.RESULT, createUpdateGetProject_resultHandler);
			addEventListener(FaultEvent.FAULT, createProject_faultHandler);
			send();
		}
		
		public function getProject():void
		{
			setPost();
			url = projectUrl + "/" + project.project_id;
			addEventListener(ResultEvent.RESULT, openProject_resultHandler);
			send();
		}
		
		public function openProject(userId:String):void
		{
			setPost();
			url = projectUrl + "/" + project.project_id + "/open/" + userId;
			addEventListener(ResultEvent.RESULT, openProject_resultHandler);
			send();
		}
		
		public function updateProject(updatedProject:Project):void
		{			
			setPost();
			project = updatedProject;
			updatedProject.project_name = updatedProject.project_name.replace(/\s/g, "");
			updatedProject.project_name = updatedProject.project_name.replace(/\./g, "");
			url = projectUrl + "/" + project.project_id + "?_method=PUT";
			request = updatedProject.toObject();
			addEventListener(ResultEvent.RESULT, createUpdateGetProject_resultHandler);
			send();
		}
		
		public function deleteProject():void
		{
			setPost();
			url = projectUrl + "/" + projectId + "?_method=DELETE";
			send();
		}
		
		/*************
		 * 
		 * Project Member actions
		 * 
		 * ***********
		 * */
		
		public function addNewMember(member:Member):void
		{
			setPost();
			url = projectUrl + "/" + project.project_id + "/members";
			request = member.toObject();
		    addEventListener(ResultEvent.RESULT, createUpdateGetProject_resultHandler);
			send();
		}
		
		public function deleteMember(memberId:String):void
		{
			setPost();
			url = projectUrl + "/" + project.project_id + "/members/" + memberId + "?_method=DELETE";
			addEventListener(ResultEvent.RESULT, createUpdateGetProject_resultHandler);
			send();
		}
		
		public function addMemberPermission(memberId:String, permission:Permission):void
		{
			setPost();
			url = projectUrl + "/" + project.project_id + "/members/" + memberId + "/permissions";
			request = permission.toObject();
			addEventListener(ResultEvent.RESULT, createUpdateGetProject_resultHandler);
			send();
		}
		
		public function removeMemberPermission(memberId:String, permissionId:String):void
		{
			setPost();
			url = projectUrl + "/" + project.project_id + "/members/" + memberId + "/permissions/" + permissionId + "?_method=DELETE";
			addEventListener(ResultEvent.RESULT, createUpdateGetProject_resultHandler);
			send();
		}
		
		public function addMemberPermissionBulk(memberId:String, permissions:Object):void
		{
			setPost();
			url = projectUrl + "/" + project.project_id + "/members/" + memberId + "/permissions/import";
			request = permissions;
			addEventListener(ResultEvent.RESULT, createUpdateGetProject_resultHandler);
			send();
		}
		
		public function removeMemberPermissionsByEnv(memberId:String, environment:String):void
		{
			setPost();
			url = projectUrl + "/" + project.project_id + "/members/" + memberId + "/env_permissions/" + environment + "?_method=DELETE";
			send();
		}
		
		/*************
		 * 
		 * Project Group actions
		 * 
		 * ***********
		 * */
		
		public function addNewGroup(groupId:String):void
		{
			setPost();
			url = projectUrl + "/" + project.project_id + "/groups/" + groupId;
			addEventListener(ResultEvent.RESULT, createUpdateGetProject_resultHandler);
			send();
		}
		
		public function removeGroup(groupId:String):void
		{
			setPost();
			url = projectUrl + "/" + project.project_id + "/groups/" + groupId + "?_method=DELETE";
			addEventListener(ResultEvent.RESULT, createUpdateGetProject_resultHandler);
			send();
		}
		
		public function addGroupPermission(groupId:String, permission:Permission):void
		{
			setPost();
			url = projectUrl + "/" + project.project_id + "/groups/" + groupId + "/permissions";
			request = permission.toObject();
			addEventListener(ResultEvent.RESULT, createUpdateGetProject_resultHandler);
			send();
		}
		
		public function removeGroupPermission(groupId:String, permissionId:String):void
		{
			setPost();
			url = projectUrl + "/" + project.project_id + "/groups/" + groupId + "/permissions/" + permissionId + "?_method=DELETE";
			addEventListener(ResultEvent.RESULT, createUpdateGetProject_resultHandler);
			send();
		}
		
		public function addGroupPermissionBulk(groupId:String, permissions:Object):void
		{
			setPost();
			url = projectUrl + "/" + project.project_id + "/groups/" + groupId + "/permissions/import";
			request = permissions;
			addEventListener(ResultEvent.RESULT, createUpdateGetProject_resultHandler);
			send();
		}
		
		public function removeGroupPermissionsByEnv(groupId:String, environment:String):void
		{
			setPost();
			url = projectUrl + "/" + project.project_id + "/groups/" + groupId + "/env_permissions/" + environment + "?_method=DELETE";
			send();
		}
		
		// Archives project.  No changes are allowed after a project has been archived
		public function archiveProject():void
		{
			setPost();
			url = projectUrl + "/" + projectId + "/archive";
		    addEventListener(ResultEvent.RESULT, createUpdateGetProject_resultHandler);
			send();
		}
		
		public function reactivateProject():void
		{
			setPost();
			url = projectUrl + "/" + projectId + "/reactivate";
			addEventListener(ResultEvent.RESULT, createUpdateGetProject_resultHandler);
			send();
		}
		
		// Freezes the current version of the project, assigning a new version number and associated change log description
		public function freezeVersion(version:Object, currentVersion:String):void
		{
			newVersionNumber = version.version.number;
			
			setPost();
			url = projectUrl + "/" + project.project_id + "/" + currentVersion  + "/freeze_version";
			request = version;
			addEventListener(ResultEvent.RESULT, freezeVersion_resultHandler);
			addEventListener(FaultEvent.FAULT, freezeVersion_faultHandler);
			send();
		}
		
		public function createVariant(variant:ProjectVariant):void
		{
			setPost();
			url = projectUrl + "/" + project.project_id + "/variants";
			request = variant.toObject();
			addEventListener(ResultEvent.RESULT, createVariant_resultHandler);
			send();
		}
		
		public function getProjectVersion(version:String):void
		{
			//Send timestamp as parameter, otherwise, result is chached from browser
			var timeStampForNoCache:Date = new Date();
			url = projectUrl + "/" + project.project_id + "/versions/" + version + ".json" + "?time=" + timeStampForNoCache.toString().replace(/\s/g);
			method = "GET";
			contentType = CONTENT_TYPE_JSON;
			serializationFilter = new JSONSerializationFilter();
		    addEventListener(ResultEvent.RESULT, getProjectVersion_resultHandler);
			send();
		}
		
		public function promoteEnvironment(version:String, environmentName:String):void
		{
			var environment:Environment = new Environment(environmentName);
			setPost();
			url = projectUrl + "/" + project.project_id + "/versions/" + version + "/promote";
			request = environment.toObject();
			addEventListener(ResultEvent.RESULT, promoteEnvironment_resultHandler);
			addEventListener(FaultEvent.FAULT, promoteEnvironment_faultHandler);
			send();
		}
		
		/*************
		 * 
		 * Project Element actions
		 * 
		 * ***********
		 * */
		
		public function createElement(element:Element, version:String):AsyncToken
		{
			setPost();
			url = projectUrl + "/" + projectId + "/" + version  + "/elements";
			request = element.toObject();
			return send();
		}
		
		public function updateElement(updatedElement:Element, version:String):AsyncToken
		{
			setPost();
			url = projectUrl + "/" + projectId + "/" + version  + "/elements/" + updatedElement.id + "?_method=PUT";
			request = updatedElement.toObject();
			return send();
		}
		
		public function deleteElement(elementId:String, version:String):void
		{
			setPost();
			url = projectUrl + "/" + projectId + "/" + version  + "/elements/" + elementId + "?_method=DELETE";
			send();
		}
		
		/*************
		 * 
		 * Project Node actions
		 * 
		 * ***********
		 * */
		
		public function createNode(node:Node, version:String):AsyncToken
		{
			setPost();
			url = projectUrl + "/" + projectId + "/" + version  + "/nodes";
			request = node.toObject();
			return send();
		}
		
		public function updateNode(updatedNode:Node, version:String):AsyncToken
		{
			setPost();
			url = projectUrl + "/" + projectId + "/" + version  + "/nodes/" + updatedNode.id + "?_method=PUT";
			request = updatedNode.toObject();
			return send();
		}
		
		public function deleteNode(nodeId:String, version:String):void
		{
			setPost();
			url = projectUrl + "/" + projectId + "/" + version  + "/nodes/" + nodeId + "?_method=DELETE";
			send();
		}
		
		public function createLink(nodeLink:Object, version:String):void
		{
			setPost();
			url = projectUrl + "/" + projectId + "/" + version  + "/nodes/link";
			request = {node_link: nodeLink};
			send();
		}
		
		/*************
		 * 
		 * Project Provision actions
		 * 
		 * ***********
		 * */
		
		public function createProvisionedVersion(name:String, version:String, environment:String):void
		{
			setPost();
			url = host + "/stackstudio/v1/provisioning/" + projectId;
			request = {provisioned_version: {stack_name: name, version: version, environment: environment}};
		    addEventListener(ResultEvent.RESULT, createProvisionedVersion_resultHandler);
			send();
		}
		
		public function createProvisionedInstances(instances:Array, provisionedId:String):void
		{
			setPost();
			url = host + "/stackstudio/v1/provisioning/" + provisionedId + "/instances";
			request = {instances: instances};
			send();
		}
		
		public function getProvisionedVersion(id:String):void
		{
			var dateTime:Date = new Date();
			var noCacheString:String = dateTime.toTimeString();
			url = host + "/stackstudio/v1/provisioning/" + id + ".json?nocahce=" + noCacheString.replace(/\s/g,"");
			addEventListener(ResultEvent.RESULT, getProvisionedVersion_resultHandler);
			send();
		}
		
		public function deleteProvisionedVersion(version:ProvisionedVersion):void
		{
			setPost();
			url = host + "/stackstudio/v1/provisioning/" + version.id + "?_method=DELETE";
			send();
		}
		
		
		
		/************************************
		 *		Result Handlers
		 ***********************************/
		
		private function projectQuery_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, projectQuery_resultHandler);
			var projects:Array = result["projects"];
			for(var index:int=0; index < projects.length; index++){
				projectsCollection.addItem(Project.buildProject(projects[index]["project"]));
			}
		}
		
		private function freezeVersion_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, freezeVersion_resultHandler);
			project.update(result["project"]);
			projectId = result["project"]["id"];
			getProjectVersion(newVersionNumber);
		}
		
		private function openProject_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, openProject_resultHandler);
			project.update(result["project"]);
			project.dispatchEvent(new ProjectEvent(ProjectEvent.PROJECT_RESULT, project));
			dispatchEvent(new ProjectEvent(ProjectEvent.PROJECT_RESULT, project));
		}
		
		private function createUpdateGetProject_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, createUpdateGetProject_resultHandler);
			if(project == null)
			{
				project = Project.buildProject(result["project"]);
			}else{
				project.update(result["project"]);
			}
			projectId = result["project"]["id"];
			getProjectVersion(project.selectedVersion);
			project.dispatchEvent(new ProjectEvent(ProjectEvent.PROJECT_RESULT));
			dispatchEvent(new ProjectEvent(ProjectEvent.PROJECT_RESULT, project));
		}
		
		private function getProjectVersion_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, getProjectVersion_resultHandler);
			if(project.currentVersion == null)
			{
				project.currentVersion = ProjectVersion.buildProjectVersion(result["project_version"], project.project_id);
			}else{
				//project.currentVersion
				project.currentVersion.update(result["project_version"], project.project_id);
			}
			project.dispatchEvent(new ProjectEvent(ProjectEvent.VERSION_SET, project));
		}
		
		private function createProvisionedVersion_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, createProvisionedVersion_resultHandler);
			var newProvisionedVersion:ProvisionedVersion = ProvisionedVersion.buildProvisionedVersion(result["provisioned_version"]); 
			project.currentProvisionedVersion = newProvisionedVersion;
			project.provisionedVersions.addItem(newProvisionedVersion);
			project.currentProvisionedVersion.addEventListener(ProvisionedVersion.INSTANCES_UPDATED, initialProvisionedInstancesSet);
			project.currentProvisionedVersion.initialNodes = project.currentVersion.nodes;
		}
		
		private function getProvisionedVersion_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, getProvisionedVersion_resultHandler);
			if(project.currentProvisionedVersion == null)
			{
				var provisionedVersionResult:Object = result["provisioned_version"];
				if(provisionedVersionResult == null)
				{
					return;
				}
				var newProvisionedVersion:ProvisionedVersion = ProvisionedVersion.buildProvisionedVersion(provisionedVersionResult); 
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
			project.dispatchEvent(new ProjectEvent(ProjectEvent.PROVISIONED_VERSION_SET, project));
		}
		
		private function createVariant_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, createVariant_resultHandler);
			project.currentVersion.variants.addItem(ProjectVariant.buildVariant(result["variant"]));
		}
		
		private function promoteEnvironment_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, promoteEnvironment_resultHandler);
			project.update(result["project"]);
			project.dispatchEvent(new PromoteEnvironmentResultEvent(result));
		}
		
		/************************************
		 *		Fault Handlers
		 ***********************************/
		
		private function freezeVersion_faultHandler(event:FaultEvent):void
		{
			removeEventListener(FaultEvent.FAULT, freezeVersion_faultHandler);
			var errorMessage:String = event.fault.content.toString();
			if(errorMessage == "")
			{
				switch(event.statusCode)
				{
					case 400:
						Alert.show(AlertMessage.FREEZE_VERSION_400);
						break;
					default:
						Alert.show(AlertMessage.FREEZE_VERSION_DEFAULT);
				}
			}
		}
		
		private function createProject_faultHandler(event:FaultEvent):void
		{
			removeEventListener(FaultEvent.FAULT, createProject_faultHandler);
			
		}
		
		private function initialProvisionedInstancesSet(event:Event):void
		{
			removeEventListener(ProvisionedVersion.INSTANCES_UPDATED, initialProvisionedInstancesSet);
			project.dispatchEvent(new Event(ProvisionedVersion.INSTANCES_UPDATED));
		}
		
		private function promoteEnvironment_faultHandler(event:FaultEvent):void
		{
			removeEventListener(FaultEvent.FAULT, promoteEnvironment_faultHandler);
			project.dispatchEvent(new PromoteEnvironmentFaultEvent(event.fault));
		}

	}
}
