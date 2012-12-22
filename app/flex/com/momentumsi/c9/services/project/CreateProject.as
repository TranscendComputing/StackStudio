package com.momentumsi.c9.services.project
{
	import com.momentumsi.c9.events.ProjectEvent;
	import com.momentumsi.c9.models.Project;
	import com.momentumsi.c9.services.TestProjectSvc;
	
	import mx.rpc.AsyncToken;
	import mx.rpc.events.FaultEvent;
	import mx.rpc.events.ResultEvent;
	
	[Event(name="projectCreated", type="com.momentumsi.c9.events.ProjectEvent")]
	[Event(name="projectCreateFailed", type="com.momentumsi.c9.events.ProjectEvent")]
	
	public class CreateProject extends TestProjectSvc
	{
		public function CreateProject()
		{
			setPost();		
			addEventListener(ResultEvent.RESULT, createProject_resultHandler);
			addEventListener(FaultEvent.FAULT, createProject_faultHandler);
		}
		
		override public function send(parameters:Object=null):AsyncToken
		{
			url = projectUrl
			request = project.toObject();
			return super.send();
		}
		
		private function createProject_resultHandler(event:ResultEvent):void
		{
			project.update(result["project"]);
			dispatchEvent(new ProjectEvent(ProjectEvent.CREATED));
		}
		
		private function createProject_faultHandler(event:FaultEvent):void
		{
			dispatchEvent(new ProjectEvent(ProjectEvent.CREATE_FAILED));
		}
	}
}