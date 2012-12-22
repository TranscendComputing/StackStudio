package com.momentumsi.c9.constants
{
	import mx.collections.ArrayCollection;

	[Bindable]
	public final class AvailabilityZones
	{
		public static const ANY:String = "Any";
		
		public static const US_EAST_1A:String = "us-east-1a";
		public static const US_EAST_1B:String = "us-east-1b";
		public static const US_EAST_1C:String = "us-east-1c";
		
		public static const US_EAST_1_ZONES:ArrayCollection = new ArrayCollection([
			US_EAST_1A,
			US_EAST_1B,
			US_EAST_1C
		]);
		
		public static const US_WEST_2A:String = "us-west-2a";
		public static const US_WEST_2B:String = "us-west-2b";
		public static const US_WEST_2C:String = "us-west-2c";
	}
}