package com.momentumsi.c9.components.rds
{
	import mx.collections.ArrayCollection;

	public class RdsWizardResources
	{
		[Bindable]
		public var engineVersions:ArrayCollection;
		[Bindable]
		public var securityGroups:ArrayCollection;
		[Bindable]
		public var parameterGroups:ArrayCollection;
		
		public function RdsWizardResources()
		{
		}
	}
}