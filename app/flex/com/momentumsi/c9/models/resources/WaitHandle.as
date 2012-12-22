package com.momentumsi.c9.models.resources
{
	import com.momentumsi.c9.constants.ResourceType;
	import com.momentumsi.c9.models.Element;
	
	public class WaitHandle extends Element
	{
		private static const DEFAULT_NAME:String = "ApplicationWaitHandle";
		
		public function WaitHandle(name:String=null)
		{
			elementType = ResourceType.WAIT_CONDITION_HANDLE;
			elementGroup = ELEMENT_GROUP_RESOURCE;
			if(name != null)
			{
				this.name = name;
			}else{
				this.name = DEFAULT_NAME;
			}
			properties = {
				Type: ResourceType.WAIT_CONDITION_HANDLE
			};
		}
	}
}