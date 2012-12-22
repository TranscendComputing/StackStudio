package com.momentumsi.c9.representers
{
	import mx.collections.ArrayCollection;
	
	import org.osmf.elements.DurationElement;
	
	[Bindable]
	public class ReservedInstanceOfferingRepresenter extends RepresenterBase
	{
		public var availabilityZone:String;
		private var _duration:int;
		public var fixedPrice:Number;
		public var instanceType:String;
		public var instanceCount:int;
		public var productDescription:String;
		public var reservedInstancesOfferingId:String;
		public var start:String;
		public var state:String;
		public var usagePrice:Number;
		public var offeringType:String;
		
		public function ReservedInstanceOfferingRepresenter(data:Object)
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
				reservedInstancesOfferingId = data.reservedInstancesOfferingId;
				start = data.start;
				state = data.state;
				usagePrice = parseFloat(data.usagePrice);
				offeringType = data.offeringType;
			}
		}
		
		public function get term():String
		{
			var months:int = _duration / 2628000;
			return months.toString() + " months";
		}
		
		public function get upfrontPrice():String
		{
			return "$" + fixedPrice.toFixed(2);
		}
		
		public function get hourlyRate():String
		{
			if(usagePrice.toFixed(3) == "0.000")
			{
				return "$0.005"; 
			}else{
				return "$" + usagePrice.toFixed(3);
			}
		}
	}
}