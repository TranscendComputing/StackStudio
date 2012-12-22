package com.momentumsi.c9.representers
{
	import com.momentumsi.c9.utils.Helpers;

	[Bindable]
	public class BeanstalkEventRepresenter extends RepresenterBase
	{
		public function BeanstalkEventRepresenter(data:Object)
		{
			super(data);
		}
		
		public function get applicationName():String 
		{
			return data.application_name;
		}
		
		public function get environmentName():String 
		{
			return data.environment_name;
		}
		
		public function get date():String 
		{
			var dateString:String = data.date;
			if(dateString != null)
			{
				return dateFormatter.format(Helpers.formatDate(dateString));
			}else{
				return UNAVAILABLE;
			}
		}
		
		public function get message():String 
		{
			return data.message;
		}
		
		public function get requestId():String 
		{
			return data.requestId;
		}
		
		public function get severity():String 
		{
			return data.severity;
		}
		
		public function get templateName():String 
		{
			return data.template_name;
		}
		
		public function get versionLabel():String 
		{
			return data.version_label;
		}
	}
}