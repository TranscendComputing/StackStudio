package com.momentumsi.c9.services.project
{
	import com.momentumsi.c9.models.Project;
	import com.momentumsi.c9.services.ApiService;
	import com.momentumsi.c9.services.TestProjectSvc;
	
	import mx.collections.ArrayCollection;
	import mx.rpc.events.FaultEvent;
	import mx.rpc.events.ResultEvent;
	
	public class ProjectQuery extends TestProjectSvc
	{
		public function ProjectQuery(project:Project)
		{
			super(project);
			addEventListener(ResultEvent.RESULT, projectQuery_resultHandler);
			addEventListener(FaultEvent.FAULT, projectQuery_faultHandler);
		}
		
		private function projectQuery_resultHandler(event:ResultEvent):void
		{
			var queryCollection:ArrayCollection = new ArrayCollection(result.projects as Array);
			for each(var projObj:Object in queryCollection)
			{
				projectsCollection.addItem(Project.buildProject(projObj.project));
			}			
		}
		
		private function projectQuery_faultHandler(event:FaultEvent):void
		{
			trace(event.fault.faultString);
		}
	}
}