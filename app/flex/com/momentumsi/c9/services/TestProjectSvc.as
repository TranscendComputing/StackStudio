package com.momentumsi.c9.services
{
	import com.momentumsi.c9.models.Project;
	import com.momentumsi.c9.services.project.DeleteProject;
	import com.momentumsi.c9.services.project.ProjectQuery;
	
	import mx.collections.ArrayCollection;
	import mx.rpc.events.ResultEvent;

	public class TestProjectSvc extends ApiService
	{
		[Bindable]
		public var project:Project;		

		public var projectsCollection:ArrayCollection;
		public var templateResources:Object;
		public var elementsArray:Array;
		public var projectUrl:String;
		
		public function TestProjectSvc(rootURL:String=null, destination:String=null)
		{
			super(rootURL, destination);
			projectUrl = this.url + "/stackstudio/v1/projects/";
		}
	}
}