package com.momentumsi.c9.services.project
{
	import com.momentumsi.c9.events.ProjectEvent;
	import com.momentumsi.c9.models.Project;
	import com.momentumsi.c9.services.TestProjectSvc;
	
	import flash.events.Event;
	
	import mx.rpc.AsyncToken;
	import mx.rpc.events.FaultEvent;
	import mx.rpc.events.ResultEvent;
	
	[Event(name="projectDeleted", type="com.momentumsi.c9.events.ProjectEvent")]
	[Event(name="projectDeleteFailed", type="com.momentumsi.c9.events.ProjectEvent")]
	
	/**
	 * Permanently deletes a project, including all associated 
	 * templates and other details. See the archive action for a 
	 * non-destructive deletion of a project.
	 * */
	public class DeleteProject extends TestProjectSvc
	{
		public function DeleteProject()
		{
			setPost();		
			addEventListener(ResultEvent.RESULT, deleteProject_resultHandler);
			addEventListener(FaultEvent.FAULT, deleteProject_faultHandler);
		}
		
		override public function send(parameters:Object=null):AsyncToken
		{
			url = projectUrl + project.projectId + "?_method=DELETE";
			return super.send(parameters);
		}
		
		private function deleteProject_resultHandler(event:ResultEvent):void
		{
			dispatchEvent(new ProjectEvent(ProjectEvent.DELETED));
		}
		
		private function deleteProject_faultHandler(event:FaultEvent):void
		{
			dispatchEvent(new ProjectEvent(ProjectEvent.DELETE_FAILED));
		}
	}
}