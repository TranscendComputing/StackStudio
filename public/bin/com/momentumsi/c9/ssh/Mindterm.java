package com.momentumsi.c9.ssh;

import com.momentumsi.c9.ssh.Launcher;
import java.applet.Applet;
import java.applet.AppletStub;
import java.io.File;
import java.io.IOException;








public class Mindterm
  extends SimpleLauncher
{
  Applet _applet = null;
  AppletStub _stub = null;
  Thread _thread = null;
  
  public Mindterm(Launchpad launchpad, Applet applet, AppletStub stub)
  {
    super(launchpad);
    
    this._applet = applet;
    this._launchpad = launchpad;
    this._stub = stub;
  } 
  
  public String getFriendlyName() {
    return "MindTerm";
  } 
  
  public boolean canPublicKeyAuth() {
    return true;
  } 
  
  public boolean canPasswordAuth() {
    return true;
  } 
  
  public int getRequiredKeyFormat() {
    return 0;
  } 
  
  public void run(String user, String host, File id) throws IOException {
    writeMindtermKey(id);
    launchMindterm();
  } 
  
  public void stop() {
    if (this._thread != null) {
      this._thread.stop();
    } 
  } 
  
  protected void writeMindtermKey(File privateKey)
    throws IOException
  {
    File dir = getMindtermDirectory();
    File mtkey = new File(dir, privateKey.getName());
    String matl = readText(privateKey);
    writePrivateKey(matl, mtkey, 300);
  } 
  
  protected void launchMindterm() {
    MindtermRunner runner = new MindtermRunner(this._launchpad, this._applet, this._stub);
    

    this._thread = new Thread(runner);
    this._thread.start();
  } 
  
  protected File getMindtermDirectory() {
    File home = new File(System.getProperty("user.home"));
    return new File(home, "mindterm");
  } 
}
