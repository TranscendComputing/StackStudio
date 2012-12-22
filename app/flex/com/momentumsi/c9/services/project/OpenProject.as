package com.momentumsi.c9.services.project
{
	import com.momentumsi.c9.events.ProjectEvent;
	import com.momentumsi.c9.models.Project;
	import com.momentumsi.c9.services.TestProjectSvc;
	
	import mx.rpc.AsyncToken;
	import mx.rpc.events.FaultEvent;
	import mx.rpc.events.ResultEvent;
	
	[Event(name="projectOpened", type="com.momentumsi.c9.events.ProjectEvent")]
	[Event(name="projectOpenFailed", type="com.momentumsi.c9.events.ProjectEvent")]
	
	/**
	 * "Opens" a project for a given user ID and retrieves a
	 *  representation of an project, including associated details.  
	 * This will update the lastopenedat for an account's project 
	 * membership, which is available via the Identity Account's
	 *  #auth and #details APIs.
	 * */
	public class OpenProject extends TestProjectSvc
	{
		public var userId:String;
		public function OpenProject()
		{
			setPost();
			addEventListener(ResultEvent.RESULT, openProject_resultHandler);
			addEventListener(FaultEvent.FAULT, openProject_faultHandler);
		}
		
		override public function send(parameters:Object=null):AsyncToken
		{
			if(userId == null)
			{
				throw new Error("User id must be specified");
			}
			url = projectUrl + project.projectId + "/open/" + userId;
			return super.send();
		}
		
		private function openProject_resultHandler(event:ResultEvent):void
		{
			dispatchEvent(new ProjectEvent(ProjectEvent.OPENED));
		}
		
		private function openProject_faultHandler(event:FaultEvent):void
		{
			dispatchEvent(new ProjectEvent(ProjectEvent.OPEN_FAILED));
		}
	}
}