package com.transcend.applet.ssh;

import java.applet.Applet;
import java.applet.AppletStub;
import java.awt.GridLayout;
import java.io.IOException;
import java.security.AccessController;
import java.security.PrivilegedExceptionAction;

class MindtermRunner implements Runnable {
	Applet _applet = null;
	AppletStub _stub = null;

	public MindtermRunner(final Applet applet, final AppletStub stub) {
		_applet = applet;
		_stub = stub;
	}

	@SuppressWarnings({ "unchecked", "rawtypes" })
	@Override
	public void run() {
		try {
			AccessController.doPrivileged(new PrivilegedExceptionAction() {
				@Override
				public Object run() throws IOException {
					try {
						final Class appletClass = Class
								.forName("com.mindbright.application.MindTerm");
						final Applet mindterm = (Applet) appletClass
								.newInstance();
						mindterm.setStub(_stub);
						_applet.setLayout(new GridLayout(1, 0));
						_applet.add(mindterm);
						MindtermRunner.this.run_(mindterm);
					} catch (final Exception e) {
						e.printStackTrace();
					}
					return null;
				}
			});
			// run_(mindterm);
		} catch (final Exception e) {
			// this._launchpad.reportError("Could not initialize MindTerm via launchpad; please contact customer care.",
			// e);
			e.printStackTrace();
		}

		_applet.validate();
	}

	public void run_(final Applet mindterm) {
		try {
			mindterm.init();
			mindterm.start();
		} catch (final Exception e) {
			// this._launchpad.reportError("Could not initialize MindTerm via launchpad; please contact customer care.",
			// e);
			e.printStackTrace();
		}

		_applet.validate();
	}
}
