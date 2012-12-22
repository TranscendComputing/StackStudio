package com.momentumsi.c9.constants
{
	import mx.collections.ArrayCollection;

	[Bindable]
	public final class InstanceTypes
	{
		//Compute Types
		public static const T1_MICRO:String = "t1.micro";
		public static const M1_SMALL:String = "m1.small";
		public static const M1_MEDIUM:String = "m1.medium";
		public static const M1_LARGE:String = "m1.large";
		public static const M1_XLARGE:String = "m1.xlarge";
		public static const M3_XLARGE:String = "m3.xlarge";
		public static const M3_2XLARGE:String = "m3.2xlarge";
		public static const M2_XLARGE:String = "m2.xlarge";
		public static const M2_2XLARGE:String = "m2.2xlarge";
		public static const M2_4XLARGE:String = "m2.4xlarge";
		public static const C1_MEDIUM:String = "c1.medium";
		public static const C1_XLARGE:String = "c1.xlarge";
		public static const CC1_4XLARGE:String = "cc1.4xlarge";
		public static const CC2_8XLARGE:String = "cc2.8xlarge";
		public static const CG1_4XLARGE:String = "cg1.4xlarge";
		public static const HI1_4XLARGE:String = "hi1.4xlarge";
		
		//Cache node types
		public static const NODE_T1_MICRO:String = "cache.t1.micro";
		public static const NODE_M1_SMALL:String = "cache.m1.small";
		public static const NODE_M1_MEDIUM:String = "cache.m1.medium";
		public static const NODE_M1_LARGE:String = "cache.m1.large";
		public static const NODE_M1_XLARGE:String = "cache.m1.xlarge";
		public static const NODE_M2_XLARGE:String = "cache.m2.xlarge";
		public static const NODE_M2_2XLARGE:String = "cache.m2.2xlarge";
		public static const NODE_M2_4XLARGE:String = "cache.m2.4xlarge";
		public static const NODE_M3_XLARGE:String = "cache.m3.xlarge";
		public static const NODE_M3_2XLARGE:String = "cache.m3.2xlarge";
		public static const NODE_C1_XLARGE:String = "cache.c1.xlarge";
		
		//AWS supported compute types
		public static const AWS_SUPPORTED_TYPES:ArrayCollection = new ArrayCollection([
			T1_MICRO,
			M1_SMALL, M1_MEDIUM, M1_LARGE, M1_XLARGE,
			M3_XLARGE, M3_2XLARGE,
			M2_XLARGE, M2_2XLARGE,M2_4XLARGE,
			C1_MEDIUM, C1_XLARGE,
			CC1_4XLARGE, CC2_8XLARGE,
			CG1_4XLARGE,
			HI1_4XLARGE
		]);
		
		//AWS supported cache node types
		public static const AWS_NODE_SUPPORTED_TYPES:ArrayCollection = new ArrayCollection([
			NODE_T1_MICRO,
			NODE_M1_SMALL, NODE_M1_MEDIUM, NODE_M1_LARGE, NODE_M1_XLARGE,
			NODE_M2_XLARGE, NODE_M2_2XLARGE, NODE_M2_4XLARGE,
			NODE_M3_XLARGE, NODE_M3_2XLARGE, NODE_C1_XLARGE
		]);
			
		
		//Topstack supported cache node types
		public static const TOPSTACK_NODE_SUPPORTED_TYPES:ArrayCollection = new ArrayCollection([
			NODE_M1_SMALL, NODE_M1_LARGE, NODE_M1_XLARGE,
			NODE_M2_XLARGE, NODE_M2_2XLARGE, NODE_M2_4XLARGE,
			NODE_C1_XLARGE
		]);
		
	}
}