package com.momentumsi.c9.representers
{
	import mx.collections.ArrayCollection;
	
	import org.osmf.elements.DurationElement;
	
	[Bindable]
	public class ReservedInstanceRepresenter extends RepresenterBase
	{
		public var availabilityZone:String;
		private var _duration:int;
		public var fixedPrice:Number;
		public var instanceType:String;
		public var instanceCount:int;
		public var productDescription:String;
		public var reservedInstancesId:String;
		public var start:String;
		public var state:String;
		public var usagePrice:Number;
		
		public function ReservedInstanceRepresenter(data:Object)
		{
			if(data != null)
			{
				super(data);
				availabilityZone = data.availabilityZone;
				_duration = parseInt(data.duration);
				fixedPrice = parseFloat(data.fixedPrice);
				instanceType = data.instanceType;
				instanceCount = parseInt(data.instanceCount);
				productDescription = data.productDescription;
				reservedInstancesId = data.reservedInstancesId;
				start = data.start;
				state = data.state;
				usagePrice = parseFloat(data.usagePrice);
			}
		}
		
		public function get term():String
		{
			var months:int = _duration / 2628000;
			return months.toString() + " months";
		}
	}
}