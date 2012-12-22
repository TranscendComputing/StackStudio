package com.momentumsi.c9.ssh;

import java.applet.Applet;
import java.applet.AppletStub;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintStream;
import java.awt.GridLayout;
import java.security.AccessController;
import java.security.PrivilegedExceptionAction;
import java.security.PrivilegedActionException;

public class Launcher extends Applet implements AppletStub {
  private static final long serialVersionUID = 1L;
  Thread _thread = null;
 
  public void init() {
/*     */     try
/*     */     {
/*  72 */       AccessController.doPrivileged(new PrivilegedExceptionAction() {
/*     */         public Object run() throws IOException {
/*  74 */           Launcher.this.init_();
/*  75 */           return null;
/*     */         } } );
/*     */     }
/*     */     catch (PrivilegedActionException e) {
/*  80 */      e.printStackTrace();
/*     */     }

  }

  public void init_(){
    localFile();
    launchMindterm();
  }

  public void start() {
/*     */     try
/*     */     {
/*  89 */       AccessController.doPrivileged(new PrivilegedExceptionAction() {
/*     */         public Object run() throws IOException {
/*  91 */           Launcher.this.start_();
/*  92 */           return null;
/*     */         } } );
/*     */     }
/*     */     catch (PrivilegedActionException e) {
/*  97 */       e.printStackTrace();
/*     */     }
  }
 
  public void start_() {}  

  public void stop() {
/*     */     try
/*     */     {
/*  89 */       AccessController.doPrivileged(new PrivilegedExceptionAction() {
/*     */         public Object run() throws IOException {
/*  91 */           Launcher.this.start_();
/*  92 */           return null;
/*     */         } } );
/*     */     }
/*     */     catch (PrivilegedActionException e) {
/*  97 */       e.printStackTrace();
/*     */     }

  }

  public void stop_() {}
  
  private void localFile() {
    try {
      File home = new File(System.getProperty("user.home"));
      File dir = new File(home, "/.transcend");

      //String dir = System.getProperty("user.home");
      //dir = dir + "/transcend";

      if(!dir.isDirectory()) {
        dir.mkdir();
      }

      //String keyDir = "/home/transcend_keys/";
      //String keyName = getKeyName();
      //String newKey = readText(getKeyContents());
      String newKey = getKeyContents();

      File localFile = new File(dir, getServerName());

      //File localFile = new File(home, "172.17.1.test");
      
      BufferedWriter localBufferedWriter = new BufferedWriter(new FileWriter(localFile, true));
      localBufferedWriter.write(newKey);
      localBufferedWriter.close();
    }
    catch (Exception localException)
    {
      System.err.println(localException.toString());
    } 
  } 
 
  public static boolean isPlatform(String platform) {
    String osName = System.getProperty("os.name");
    return osName.toLowerCase().indexOf(platform.toLowerCase()) != -1;
  }
 
  protected String getKeyContents() {
    String contents = getParameter("key-contents");
    return contents;
  }

  protected String getKeyName() {
    String str = getParameter("key-name");
    return str;
  } 
  
  protected String getServerName() {
    String str = getParameter("server");
    return str;
  } 
  
  private static String readText(String paramString) throws IOException {
    String str1 = System.getProperty("line.separator");
    
    FileInputStream localFileInputStream = new FileInputStream(paramString);
    BufferedReader localBufferedReader = new BufferedReader(new InputStreamReader(localFileInputStream));
    
    StringBuffer localStringBuffer = new StringBuffer();
    String str2 = null;
    do
    {
      str2 = localBufferedReader.readLine();
      if (str2 != null) {
        localStringBuffer.append(str2);
        localStringBuffer.append(str1);
      } 
    } while (str2 != null);
    
    return localStringBuffer.toString();
  } 
  
  public void appletResize(int paramInt1, int paramInt2) {}

  protected void launchMindterm() {
         MindtermRunner runner = new MindtermRunner(this, this);
         this._thread = new Thread(runner);
         this._thread.start();
  }
} 
