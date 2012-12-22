package com.momentumsi.c9.ssh;

import com.momentumsi.c9.ssh.Launcher;
import java.applet.Applet;
import java.applet.AppletStub;
import java.awt.GridLayout;
import java.security.AccessController;
import java.security.PrivilegedExceptionAction;
import java.security.PrivilegedActionException;
import java.io.IOException;


class MindtermRunner
  implements Runnable
{
  //Launchpad _launchpad = null;
  Applet _applet = null;
  AppletStub _stub = null;
  
  public MindtermRunner(Applet applet, AppletStub stub) {
    this._applet = applet;
    this._stub = stub;
  } 
  
  public void run() {
    try {
      Class appletClass = Class.forName("com.mindbright.application.MindTerm");
      Applet mindterm = (Applet)appletClass.newInstance();
      
      mindterm.setStub(this._stub);
      this._applet.setLayout(new GridLayout(1, 0));
      this._applet.add(mindterm);
      mindterm.init();
      mindterm.start();
    }
    catch (Exception e) {
      //this._launchpad.reportError("Could not initialize MindTerm via launchpad; please contact customer care.", e);
      e.printStackTrace();
    } 
    
    this._applet.validate();
  }
} 
