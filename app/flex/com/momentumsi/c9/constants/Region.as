package com.momentumsi.c9.constants
{
	import mx.collections.ArrayCollection;

	public final class Region
	{
		public static const US_EAST_1:String = "us-east-1";
		public static const US_WEST_1:String = "us-west-1";
		public static const US_WEST_2:String = "us-west-2";
		public static const EU_WEST_1:String = "eu-west-1";
		public static const AP_SOUTHEAST_1:String = "ap-southeast-1";
		public static const AP_SOUTHEAST_2:String = "ap-southeast-2";
		public static const AP_NORTHEAST_1:String = "ap-northeast-1";
		public static const SA_EAST_1:String = "sa-east-1";
		
		//AWS Regions
		public static const AMAZON:ArrayCollection = new ArrayCollection([{label: "US East (Virginia)", value: US_EAST_1},
																		{label: "US West (Northern California)", value: US_WEST_1},
																		{label: "US West (Oregon)", value: US_WEST_2},
																		{label: "EU (Ireland)", value: "eu-west-1"},
																		{label: "Asia Pacific (Singapore)", value: AP_SOUTHEAST_1},
																		{label: "Asia Pacific (Sydney)", value: AP_SOUTHEAST_2},
																		{label: "Asia Pacific (Tokyo)", value: AP_NORTHEAST_1},
																		{label: "South America (Sao Paulo)", value: SA_EAST_1}]);
	}
}
