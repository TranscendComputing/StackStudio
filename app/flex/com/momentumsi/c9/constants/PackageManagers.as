package com.momentumsi.c9.constants
{
	import com.momentumsi.c9.models.resources.CFInit;
	import com.momentumsi.c9.models.resources.cfInit.Package;
	
	import mx.collections.ArrayCollection;

	public class PackageManagers
	{
		public static const APT_PACKAGES:ArrayCollection = new ArrayCollection([
			new Package(CFInit.APT_PACKAGE, "ruby", [], false),
			new Package(CFInit.APT_PACKAGE, "ruby-dev", [], false),
			new Package(CFInit.APT_PACKAGE, "libopenssl-ruby", [], false),
			new Package(CFInit.APT_PACKAGE, "rdoc", [], false),
			new Package(CFInit.APT_PACKAGE, "ri", [], false),
			new Package(CFInit.APT_PACKAGE, "irb", [], false),
			new Package(CFInit.APT_PACKAGE, "build-essential", [], false),
			new Package(CFInit.APT_PACKAGE, "wget", [], false),
			new Package(CFInit.APT_PACKAGE, "ssl-cert", [], false),
			new Package(CFInit.APT_PACKAGE, "rubygems", [], false),
			new Package(CFInit.APT_PACKAGE, "s3cmd", [], false)
		]);
		
		public static const RUBYGEMS_PACKAGES:ArrayCollection = new ArrayCollection([
			new Package(CFInit.RUBYGEMS_PACKAGE, "chef", [], false),
			new Package(CFInit.RUBYGEMS_PACKAGE, "ohai", ["0.6.4"], false)
		]);
	}
}