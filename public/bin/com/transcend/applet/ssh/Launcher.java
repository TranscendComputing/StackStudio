package com.transcend.applet.ssh;

import java.applet.Applet;
import java.applet.AppletStub;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.security.AccessController;
import java.security.PrivilegedActionException;
import java.security.PrivilegedExceptionAction;

public class Launcher extends Applet implements AppletStub {
	private static final long serialVersionUID = 1L;

	public static boolean isPlatform(final String platform) {
		final String osName = System.getProperty("os.name");
		return osName.toLowerCase().indexOf(platform.toLowerCase()) != -1;
	}

	// private static String readText(final String paramString) throws
	// IOException {
	// final String str1 = System.getProperty("line.separator");
	//
	// final FileInputStream localFileInputStream = new FileInputStream(
	// paramString);
	// final BufferedReader localBufferedReader = new BufferedReader(
	// new InputStreamReader(localFileInputStream));
	//
	// final StringBuffer localStringBuffer = new StringBuffer();
	// String str2 = null;
	// do {
	// str2 = localBufferedReader.readLine();
	// if (str2 != null) {
	// localStringBuffer.append(str2);
	// localStringBuffer.append(str1);
	// }
	// } while (str2 != null);
	//
	// return localStringBuffer.toString();
	// }

	@Override
	public void appletResize(final int paramInt1, final int paramInt2) {
	}

	protected String getKeyContents() {
		final String contents = getParameter("key-contents");
		return contents;
	}

	protected String getKeyName() {
		return getParameter("private-key");
	}

	protected String getServerName() {
		return getParameter("server");
	}

	@SuppressWarnings({ "unchecked", "rawtypes" })
	@Override
	public void init() {
		try {
			AccessController.doPrivileged(new PrivilegedExceptionAction() {
				@Override
				public Object run() throws IOException {
					Launcher.this.init_();
					return null;
				}
			});
		} catch (final PrivilegedActionException e) {
			System.err
					.println("Failed to acquire the privilege necessary to initialize the applet."
							+ e);
		}
	}

	public void init_() {
		localFile();
	}

	protected void launchMindterm() {
		final MindtermRunner runner = new MindtermRunner(this, this);
		Thread thread = null;
		thread = new Thread(runner);
		thread.start();
		// runner.run();
	}

	private void localFile() {
		try {
			final File home = new File(System.getProperty("user.home"));
			final File dir = new File(home, "/mindterm");
			if (!dir.isDirectory()) {
				dir.mkdir();
			}

			// String newKey = readText(getKeyContents());
			final String newKey = getKeyContents();
			final String newline = System.getProperty("line.separator");
			final StringBuffer sb = new StringBuffer();
			for (int i = 0; i < newKey.length(); i++) {
				final char c = newKey.charAt(i);
				if (c == '*') {
					sb.append(newline);
				} else {
					sb.append(c);
				}
			}
			final File localFile = new File(dir, getKeyName());
			localFile.delete();
			final BufferedWriter localBufferedWriter = new BufferedWriter(
					new FileWriter(localFile, true));
			localBufferedWriter.write(sb.toString());
			localBufferedWriter.close();
		} catch (final Exception localException) {
			System.err.println(localException.toString());
		}
	}

	@SuppressWarnings({ "unchecked", "rawtypes" })
	@Override
	public void start() {
		try {
			AccessController.doPrivileged(new PrivilegedExceptionAction() {
				@Override
				public Object run() throws IOException {
					start_();
					return null;
				}
			});
		} catch (final PrivilegedActionException e) {
			System.err
					.println("Failed to acquire the privilege necessary to initialize the applet."
							+ e);
		}
	}

	public void start_() {
		launchMindterm();
	}

	@Override
	public void stop() {
	}
}
