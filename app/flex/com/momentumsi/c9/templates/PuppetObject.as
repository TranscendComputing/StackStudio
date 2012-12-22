package com.momentumsi.c9.templates
{
	import com.momentumsi.c9.constants.ResourceType;
	import com.momentumsi.c9.models.Element;
	import com.momentumsi.c9.utils.URLParser;
	
	import mx.collections.ArrayCollection;

	public class PuppetObject extends InstallObject
	{
		protected var _puppetMaster:Object = {Ref: "PuppetMasterDNSName"};
		public var puppetPeInstall:Object = "puppet-enterprise-2.6.1-all.tgz";
		public var puppetAgentDomain:Object = ".transcendcomputing.com";
		
		public function PuppetObject(roles:Array, puppetServerUrl:Object=null, puppetConfigBucket:Object=null)
		{
			if(puppetServerUrl != null && puppetServerUrl is String)
			{
				URLParser.parse(String(puppetServerUrl));
				_puppetMaster = URLParser.host;
			}
			
			super(ResourceType.PUPPET_MODULE, roles, puppetServerUrl, puppetConfigBucket);
		}
	}
}