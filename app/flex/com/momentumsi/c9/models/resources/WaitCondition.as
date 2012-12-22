package com.momentumsi.c9.models.resources
{
	import com.momentumsi.c9.constants.ResourceType;
	import com.momentumsi.c9.models.Element;
	
	[Bindable]
	public class WaitCondition extends Element
	{
		private static const DEFAULT_NAME:String = "InstallWaitCondition";
		
		private var timeout:String = "1200";
		
		public function WaitCondition(dependsOn:String, handle:Object, timeout:String=null, name:String=null)
		{
			elementType = ResourceType.WAIT_CONDITION;
			elementGroup = Element.ELEMENT_GROUP_RESOURCE;
			
			if(name != null)
			{
				this.name = name;
			}else{
				this.name = DEFAULT_NAME; 
			}
			
			if(timeout != null)
			{
				this.timeout = timeout;
			}
			
			properties = {
				Type: ResourceType.WAIT_CONDITION,
					DependsOn: dependsOn,
					Properties: {
						Handle: handle,
						Timeout: this.timeout
					}
			};
		}
	}
}