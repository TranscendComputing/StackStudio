package com.momentumsi.c9.representers
{
	import com.momentumsi.c9.utils.Helpers;

	public class SpotPrice extends RepresenterBase
	{
		public var instanceType:String;
		public var productDescription:String;
		public var spotPrice:Number;
		public var timestamp:Date;
		public var availabilityZone:String;
		
		public function SpotPrice(data:Object)
		{
			super(data);
			
			instanceType = data.instanceType;
			productDescription = data.productDescription;
			spotPrice = parseFloat(data.spotPrice);
			availabilityZone = data.availabilityZone;
			
			var dateString:String = data.timestamp;
			if(dateString != null)
			{
				timestamp = Helpers.formatDate(dateString);
			}
		}
	}
}