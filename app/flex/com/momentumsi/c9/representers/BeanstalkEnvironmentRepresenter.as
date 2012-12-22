package com.momentumsi.c9.representers
{
	import com.maccherone.json.JSON;
	
	import mx.collections.ArrayCollection;

	[Bindable]
	public class BeanstalkEnvironmentRepresenter extends RepresenterBase
	{
		public var resourcesCollection:ArrayCollection
		public function BeanstalkEnvironmentRepresenter(data:Object)
		{
			super(data);
			resourcesCollection = new ArrayCollection(data.resources as Array);
		}
		
		public function get name():String
		{
			return data.name;
		}
		
		public function get description():String
		{
			return data.description;
		}
		
		public function get containerType():String
		{
			if(data.solution_stack_name)
			{
				return data.solution_stack_name;
			}else{
				return data.template_name;
			}
		}
		
		public function get environmentId():String
		{
			return data.id;
		}
		
		public function get health():String
		{
			return data.health;
		}
		
		public function get cname():String
		{
			return data.cname;
		}
		
		public function get endpointUrl():String
		{
			return data.endpoint_url;
		}
		
		public function get applicationName():String
		{
			return data.application_name;
		}
		
		public function get status():String
		{
			return data.status;
		}
		
		public function get versionLabel():String
		{
			return data.version_label;
		}
		
		public function get loadBalancer():String
		{
			if(data.resources.hasOwnProperty("LoadBalancers") && data.resources.LoadBalancers.length > 0)
			{
				return data.resources.LoadBalancers[0].Name;
			}else
			{
				return new String();
			}
		}
		
		public function get autoScaleGroup():String
		{
			if(data.resources.hasOwnProperty("AutoScalingGroups") && data.resources.AutoScalingGroups.length > 0)
			{
				return data.resources.AutoScalingGroups[0].Name;
			}else
			{
				return new String();
			}
		}
	}
}