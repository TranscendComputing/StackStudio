package com.momentumsi.c9.events
{
	import com.momentumsi.c9.models.Project;
	
	import flash.events.Event;
	
	public class ProjectEvent extends Event
	{
		public static const PROJECT_RESULT:String = "projectResult";
		public static const PROVISIONED_VERSION_SET:String = "provisionedVersionSet";
		public static const VERSION_SET:String = "versionSet";
		public var project:Project;
		public function ProjectEvent(type:String, result:Object=null)
		{
			super(type);
			if(type == PROJECT_RESULT && result is Project)
			{
				project = result as Project;
			}else if(type == VERSION_SET && result is Project)
			{
				project = result as Project;
			}
		}
	}
}