package com.momentumsi.c9.representers
{
	import mx.collections.ArrayCollection;

	[Bindable]
	public class BeanstalkApplicationRepresenter extends RepresenterBase
	{
		public var environmentsCollection:ArrayCollection = new ArrayCollection();
		public var versionsCollection:ArrayCollection = new ArrayCollection();
		private var _events:ArrayCollection = new ArrayCollection();
		
		public function BeanstalkApplicationRepresenter(data:Object)
		{
			if(data.created_at != null)
			{
				super(data);
				var tmpCollection:ArrayCollection;
				var item:Object;
				
				environmentsCollection = new ArrayCollection(data.environments as Array);
				versionsCollection = new ArrayCollection(data.versions as Array);
				events = new ArrayCollection(data.events as Array);
			}
		}
		
		public function get name():String
		{
			return data.name;
		}
		
		public function get description():String
		{
			return data.description;
		}
		
		public function get events():ArrayCollection 
		{
			return _events;
		}
		
		public function set events(value:ArrayCollection):void 
		{
			_events.removeAll();
			for each(var item:Object in value)
			{
				_events.addItem(new BeanstalkEventRepresenter(item));
			}
		}
	}
}