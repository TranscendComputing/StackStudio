package com.momentumsi.c9.services.project
{
	import com.momentumsi.c9.events.ProjectEvent;
	import com.momentumsi.c9.models.Project;
	import com.momentumsi.c9.services.TestProjectSvc;
	
	import mx.rpc.AsyncToken;
	import mx.rpc.events.FaultEvent;
	import mx.rpc.events.ResultEvent;
	
	public class UpdateProject extends TestProjectSvc
	{
		public function UpdateProject(rootURL:String=null, destination:String=null)
		{
			super(rootURL, destination);
			setPost(
			url = projectUrl + project.projectId + "?_method=PUT";
			addEventListener(ResultEvent.RESULT, updateProject_resultHandler);
			addEventListener(FaultEvent.FAULT, updateProject_faultHandler);
		}
		
		override public function send(parameters:Object=null):AsyncToken
		{
			request = project.toObject();
			super.send();
		}
		
		private function updateProject_resultHandler(event:ResultEvent):void
		{
			if(project == null)
			{
				project = Project.buildProject(result["project"]);
			}else{
				project.update(result["project"]);
			}
			dispatchEvent(new ProjectEvent(ProjectEvent.UPDATED));
		}
		
		private function updateProject_faultHandler(event:FaultEvent):void
		{
			dispatchEvent(new ProjectEvent(ProjectEvent.UPDATE_FAILED));
		}
		
	}
}