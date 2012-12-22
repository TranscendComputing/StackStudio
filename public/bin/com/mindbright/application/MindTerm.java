/******************************************************************************
 *
 * Copyright (c) 1999-2011 Cryptzone AB. All Rights Reserved.
 * 
 * This file contains Original Code and/or Modifications of Original Code as
 * defined in and that are subject to the MindTerm Public Source License,
 * Version 2.0, (the 'License'). You may not use this file except in compliance
 * with the License.
 * 
 * You should have received a copy of the MindTerm Public Source License
 * along with this software; see the file LICENSE.  If not, write to
 * Cryptzone Group AB, Drakegatan 7, SE-41250 Goteborg, SWEDEN
 *
 *****************************************************************************/

package com.mindbright.application;

import java.applet.AppletContext;

import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Container;

import java.awt.event.WindowEvent;
import java.awt.event.WindowListener;

import java.io.*;

import java.util.Enumeration;
import java.util.Hashtable;
import java.util.Properties;

import javax.swing.JApplet;
import javax.swing.JFrame;
import javax.swing.JMenuBar;

import com.mindbright.ssh.*;

import com.mindbright.sshcommon.*;

import com.mindbright.terminal.*;
import com.mindbright.gui.GUI;

public class MindTerm extends JApplet implements Runnable, WindowListener {
	private static final long serialVersionUID = 1L;

    static Properties paramTermProps = new Properties();
    static Properties paramSSHProps  = new Properties();

    public static String javaVersion = "<unknown>";
    public static String javaVendor  = "<unknown>";
    public static String osName      = "<unknown>";
    public static String osArch      = "<unknown>";
    public static String osVersion   = "<unknown>";

    Container            container;
    TerminalWin          term;
    SSHInteractiveClient client;
    SSHInteractiveClient sshClone;
    SSHStdIO             console;
    Thread               clientThread;
    
    boolean    mergedTermProps;
    Properties sshProps;
    Properties termProps;

    String[]   cmdLineArgs;

    String  commandLine = null;
    String  sshHomeDir  = null;
    String  propsFile   = null;

    boolean usePopMenu   = false;
    boolean haveMenus    = true;
    boolean haveGUI      = true;
    boolean exitOnLogout = false;
    boolean quiet        = true;

    boolean doSCP        = false;
    boolean recursiveSCP = false;
    boolean toRemote     = true;
    int     firstArg     = 0;

    boolean autoSaveProps = true;
    boolean autoLoadProps = true;

    boolean savePasswords = false;

    int     popButtonNum = 3;

    boolean isClosing  = false;

    // !!!
    boolean        separateFrame = true;
    protected JFrame frame = null;
    public boolean weAreAnApplet = false;
    boolean        useAWT = false;

    Hashtable<MindTerm, MindTerm> terminals = new Hashtable<MindTerm, MindTerm>();

    private Object initLock;

    synchronized boolean isLastTerminal() {
        return terminals.isEmpty();
    }

    synchronized void addTerminal(MindTerm mindterm) {
        terminals.put(mindterm, mindterm);
    }

    synchronized void removeTerminal(MindTerm mindterm) {
        terminals.remove(mindterm);
    }

    public MindTerm() {
        super();
        this.sshProps  = paramSSHProps;
        this.termProps = paramTermProps;
        addTerminal(this);
    }

    public MindTerm(Properties sshProps, Properties termProps) {
        this.sshProps  = sshProps;
        this.termProps = termProps;
        addTerminal(this);
    }

    public static void main(String[] argv) {        
        MindTerm controller    = new MindTerm(paramSSHProps, paramTermProps);
        controller.cmdLineArgs = argv;

        try {
            controller.getApplicationParams();
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("Error: " + e.getMessage());
            System.exit(1);
        }

        try {
            controller.run();
        } catch (Exception e) {
            System.out.println("Internal error running controller");
            e.printStackTrace();
        }
    }

    public void init() {
        initLock = new Object();
        weAreAnApplet  = true;
        autoSaveProps  = false;
        autoLoadProps  = false;
        savePasswords  = false;

        getAppletParams();

        (new Thread(this, "MindTerm.init")).start();

        synchronized(initLock) {
            try {
                initLock.wait();
            } catch (Exception e) {}
        }
    }

    public void run() {
        try {
            if(sshClone != null) {
                if(!sshClone.isSSH2) {
                    client = new SSHInteractiveClient(sshClone);
                    sshClone = null;
                } else {
                    client = null;
                    sshClone.newShell();
                    removeTerminal(this);
                    return;
                }
            } else {
                // Default when running single command is not to allocate a PTY
                //
                if(commandLine != null
                        && sshProps.getProperty("force-pty") == null) {
                    sshProps.put("force-pty", "false");
                }

                SSHPropertyHandler propsHandler =
                    new SSHPropertyHandler(sshProps, true);

                if(propsFile != null) {
                    try {
                        propsHandler =
                            SSHPropertyHandler.fromFile(propsFile, "");
                    } catch (SSHClient.AuthFailException e) {
                        throw new Exception("Sorry, can only use passwordless"
                                            + "settings files for now");
                    } catch (FileNotFoundException fe) {
                        System.out.println("Settings-file not found: " +
                                           fe.getMessage());
                        propsHandler = new SSHPropertyHandler();
                    }
                    propsHandler.mergeProperties(sshProps);
                }

                client = new SSHInteractiveClient(quiet, exitOnLogout,
                                                  propsHandler);
            }

            SSHPropertyHandler props = client.getPropertyHandler();
            if(weAreAnApplet && props.getDefaultProperty("server") == null){
                props.setDefaultProperty("server", getCodeBase().getHost());
            }
            if (props.getDefaultProperty("username") == null) {
                String auto = props.getDefaultProperty("auto-username");
                if (Boolean.valueOf(auto).booleanValue()) {
                    try {
                        String user = System.getProperty("user.name", "");
                        props.setDefaultProperty("username", user);
                    } catch (Throwable t) {
                        System.err.println("Failed to get username: " + t);
                    }
                }
            }

            console = (SSHStdIO)client.getConsole();

            // If we loaded a specific property-file we merge the
            // termProps from there
            //
            if(props.getInitTerminalProperties()!=null) {
                Properties newTermProps = new Properties(
                    props.getInitTerminalProperties());
                if(termProps != null && !termProps.isEmpty()) {
                    Enumeration<Object> e = termProps.keys();
                    while(e.hasMoreElements()) {
                        String name = (String)e.nextElement();
                        newTermProps.put(name, termProps.getProperty(name));
                    }
                    mergedTermProps = true;
                }
                termProps = newTermProps;
            }

            // First we initialize the GUI if we have one (to be able to set
            // properties to terminal
            //
            if(haveGUI) {
                try {
                    javax.swing.SwingUtilities.invokeAndWait(new Runnable() {
                        public void run() {
                            initGUI();
                        }
                    });
                } catch (Exception e) {
                    e.printStackTrace();
                    System.err.println("initGUI didn't successfully complete");
                }
                console.setTerminal(term);
                console.setOwnerContainer(container);
                console.setOwnerName(SSH.VER_MINDTERM);
                console.updateTitle();

                try {
                    while(!container.isShowing())
                        Thread.sleep(50);
                } catch(InterruptedException e) {
                    // !!!
                }
            }

            if(!props.setSSHHomeDir(sshHomeDir)) {
                throw new Exception("License not accepted, exiting");
            }
            props.setAutoSaveProps(autoSaveProps);
            props.setAutoLoadProps(autoLoadProps);
            props.setSavePasswords(savePasswords);
            client.updateMenus();

            if(commandLine != null) {
                if(!doSCP) {
                    clientThread = new Thread(new Runnable() {
                        public void run() {
                            try {
                                client.doSingleCommand(commandLine);
                            } catch (Throwable tttt) {
                            }
                        }
                    }, "MindTerm commandline");
                    clientThread.start();
                    clientThread.join();
                } else {
                    if((cmdLineArgs.length - firstArg) < 2)
                        throw new Exception(
                            "scp must have at least two arguments (<source> "
                            + "<destination>)");
                    String[] fileList =
                        new String[cmdLineArgs.length - firstArg - 1];
                    String  target, source =
                        commandLine.substring(0, commandLine.lastIndexOf(' '));
                    for(int i = firstArg; i < cmdLineArgs.length - 1; i++) {
                        fileList[i - firstArg] = cmdLineArgs[i];
                    }
                    target = cmdLineArgs[cmdLineArgs.length - 1];
                    String srvHost = props.getSrvHost();
                    int    srvPort = props.getSrvPort();
                    SSHSCPClient scp = new SSHSCPClient(
                                           srvHost, srvPort, props,
                                           (SSH.DEBUG ? client : null), new File("."), SSH.DEBUG);
                    if(SSH.DEBUG) {
                        scp.scp1().setProgress(new SSHSCPStdoutProgress());
                    }
                    if(toRemote) {
                        scp.scp1().copyToRemote(fileList, target,recursiveSCP);
                    } else {
                        scp.scp1().copyToLocal(target, source, recursiveSCP);
                    }
                }
            } else {
                try {
                    clientThread = new Thread(client, "MindTerm");
                    clientThread.start();
                    clientThread.join();
                } catch(InterruptedException e) {
                    // !!!
                }
            }

        } catch (IllegalArgumentException ae) {
            if(client != null)
                client.alert(ae.getMessage());
            System.out.println(ae.getMessage());
        } catch (FileNotFoundException fe) {
            System.out.println("Settings-file not found: " + fe.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            if(client != null)
                client.alert("Error: "  + e.getMessage());
            System.out.println("Error: " + e.getMessage());
            if(SSH.DEBUGMORE) {
                e.printStackTrace();
            }
        }

        // Do not ask for confirmation in this case
        confirmedClose = true;

        windowClosing(null);
        if(isLastTerminal())
            doExit();
    }

    public void getAppletParams() {
        String    name;
        String    value;
        String    param;
        int       i;

        try {
            useAWT = (new Boolean(getParameter("useAWT"))).booleanValue();
        } catch (Exception e) {
        }

        try {
            separateFrame = (new Boolean(getParameter("sepframe"))).booleanValue();
        } catch (Exception e) {
            separateFrame = true;
        }
        try {
            SSH.DEBUG = (new Boolean(getParameter("verbose"))).booleanValue();
        } catch (Exception e) {
            SSH.DEBUG = false;
        }

        try {
            SSH.DEBUGMORE = (new Boolean(getParameter("debug"))).booleanValue();
            SSH.DEBUG = SSH.DEBUGMORE;
        } catch (Exception e) {}

        try {
            quiet = (new Boolean(getParameter("quiet"))).booleanValue();
        } catch (Exception e) {
            quiet = true;
        }

        try {
            exitOnLogout = (new Boolean(getParameter("exit-on-logout"))).booleanValue();
        } catch (Exception e) {
            exitOnLogout = false;
        }

        try {
            savePasswords = (new Boolean(getParameter("savepasswords"))).booleanValue();
        } catch (Exception e) {
            savePasswords = false;
        }

        param = getParameter("menus").toLowerCase();
        if(param != null) {
            if(param.startsWith("pop")) {
                getPopupButtonNumber(param);
                usePopMenu = true;
            } else if (!param.equals("yes") && !param.equals("true")) {
                haveMenus = false;
            }
        }

        param = getParameter("autoprops");
        if(param != null) {
            if(param.equals("save")) {
                autoSaveProps = true;
                autoLoadProps = false;
            } else if(param.equals("load")) {
                autoSaveProps = false;
                autoLoadProps = true;
            } else if(param.equals("both")) {
                autoSaveProps = true;
                autoLoadProps = true;
            }
        }

        sshHomeDir  = getParameter("sshhome");
        propsFile   = getParameter("propsfile");
        commandLine = getParameter("commandline");

        getDefaultParams();

        for(i = 0; i < SSHPropertyHandler.defaultPropDesc.length; i++) {
            name  = SSHPropertyHandler.defaultPropDesc[i][SSHPropertyHandler.PROP_NAME];
            value = getParameter(name);
            if(value != null)
                paramSSHProps.put(name, value);
        }
        i = 0;
        while((value = getParameter("local" + i)) != null) {
            paramSSHProps.put("local" + i, value);
            i++;
        }
        i = 0;
        while((value = getParameter("remote" + i)) != null) {
            paramSSHProps.put("remote" + i, value);
            i++;
        }

        String tPropNames[] = TerminalWin.getPropertyNames();
        for(i = 0; i < tPropNames.length; i++) {
            name  = tPropNames[i];
            value = getParameter(name);
            if(value != null)
                termProps.put(name, value);
        }

        param = getParameter("appletbg");
        if(param != null) {
            Color c;
            try {
                c = TerminalWin.getTermColor(param);
            } catch (IllegalArgumentException e) {
                try {
                    c = TerminalWin.getTermRGBColor(param);
                } catch (Throwable t) {
                    c = null;
                    // !!!
                }
            }
            if(c != null)
                this.setBackground(c);
        }
    }

    public AppletContext getAppletContext() {
        AppletContext ctx = null;
        if(weAreAnApplet) {
            ctx = super.getAppletContext();
        }
        return ctx;
    }

    public void getApplicationParams() throws Exception {
        int       i;

        getDefaultParams();

        // First we check the MindTerm options (i.e. not the
        // ssh/terminal-properties)
        //
        try {
            for(i = 0; i < cmdLineArgs.length; i++) {
                String arg = cmdLineArgs[i];
                if (arg.startsWith("--")) {
                    switch(arg.charAt(2)) {
                    case 'h':
                        sshHomeDir = cmdLineArgs[++i];
                        break;
                    case 'f':
                        propsFile = cmdLineArgs[++i];
                        break;
                    case 'd':
                        haveGUI = false;
                        break;
                    case 'e':
                        exitOnLogout = true;
                        break;
                    case 'm': {
                        String typ = cmdLineArgs[++i];
                        if(typ.equals("no"))
                            haveMenus = false;
                        else if(typ.startsWith("pop")) {
                            getPopupButtonNumber(typ);
                            usePopMenu = true;
                        } else
                            throw new Exception("value of '--m' must be 'no', "
                                                + "'pop1', 'pop2', or 'pop3'");
                        break;
                    }
                    case 'p': {
                        String typ = cmdLineArgs[++i];
                        if(typ.equals("save")) {
                            autoSaveProps = true;
                            autoLoadProps = false;
                        } else if(typ.equals("load")) {
                            autoSaveProps = false;
                            autoLoadProps = true;
                        } else if(typ.equals("both")) {
                            autoSaveProps = true;
                            autoLoadProps = true;
                        } else if(typ.equals("none")) {
                            autoSaveProps = false;
                            autoLoadProps = false;
                        } else
                            throw new Exception("value of '--p' must be 'save', "
                                                + "'load', 'both', or 'none'");
                        break;
                    }
                    case 'q':
                        String val = cmdLineArgs[++i];
                        if(val.equalsIgnoreCase("true")
                           || val.equalsIgnoreCase("false")) {
                            quiet = Boolean.valueOf(val).booleanValue();
                        } else {
                            throw new Exception(
                                "value of '--q' must be 'true' or 'false'");
                        }
                        break;
                    case 'r':
                        recursiveSCP = true;
                        break;
                    case 's':
                        haveGUI = false;
                        doSCP   = true;
                        String direction = cmdLineArgs[++i];
                        if(direction.equalsIgnoreCase("toremote")) {
                            toRemote = true;
                        } else if(direction.equalsIgnoreCase("tolocal")) {
                            toRemote = false;
                        } else {
                            throw new Exception("value of '--s' must be "
                                                + "'toremote' or 'tolocal'");
                        }
                        break;
                    case 'v':
                        System.out.println("verbose mode selected...");
                        SSH.DEBUG = true;
                        break;
                    case 'x':
                        savePasswords = true;
                        break;
                    case 'V':
                        System.out.println(SSH.VER_MINDTERM);
                        System.out.println(
                            "SSH protocol version "
                            + SSH.SSH_VER_MAJOR + "." + SSH.SSH_VER_MINOR);
                        System.exit(0);
                        break;
                    case 'D':
                        SSH.DEBUG     = true;
                        SSH.DEBUGMORE = true;
                        break;
                    case '?':
                        printHelp();
                        System.exit(0);
                    default:
                        throw new Exception("unknown parameter '" + arg + "'");
                    }
                } else if ((arg.charAt(0)=='-') && (i < cmdLineArgs.length-1)){
                    String name = arg.substring(1);
                    String value = cmdLineArgs[++i];
                    if(SSHPropertyHandler.isProperty(name)) {
                        paramSSHProps.put(name, value);
                    } else if(TerminalWin.isProperty(name)) {
                        paramTermProps.put(name, value);
                    } else {
                        System.out.println("Unknown property '" + name + "'");
                    }
                } else {
                    break;
                }
            }
        } catch (Exception e) {
            printHelp();
            throw e;
        }

        if(i < cmdLineArgs.length) {
            firstArg = i;
            commandLine = "";
            for(; i < cmdLineArgs.length; i++) {
                commandLine += cmdLineArgs[i] + " ";
            }
            commandLine = commandLine.trim();
        }
    }

    void printHelp() {
        System.out.println("usage: MindTerm [options] [properties] [commandline]");
        System.out.println("Options:");
        System.out.println("  --d            No terminal-window, only dumb command-line and port-forwarding.");
        System.out.println("  --e            Exit MindTerm after logout (i.e. single session).");
        System.out.println("  --f <file>     Use settings from the given file as default.");
        System.out.println("  --h dir        Name of the MindTerm home-dir (default: ~/mindterm/).");
        System.out.println("  --m <no | pop | popN>");
        System.out.println("                 Use no menus or popup (on mouse-button N) menu.");
        System.out.println("  --p <save | load | both | none>");
        System.out.println("                 Sets automatic save/load flags for property-files.");
        System.out.println("  --q <true | false>");
        System.out.println("                 Quiet; don't query for server/username if given.");
        System.out.println("  --v            Verbose; display verbose messages.");
        System.out.println("  --x            Save passwords in encrypted property-files.");
        System.out.println("  --D            Debug; display extra debug info.");
        System.out.println("  --V            Version; display version number only.");
        System.out.println("  --?            Help; display this help.");
    }

    void getPopupButtonNumber(String param) {
        if(param.length() == 4) {
            try {
                popButtonNum = Integer.valueOf(param.substring(3)).intValue();
                if(popButtonNum < 1 || popButtonNum > 3)
                    popButtonNum = 3;
            } catch (NumberFormatException e) {
                // !!!
            }
        }
    }

    void getDefaultParams() {
        try {
            javaVersion = System.getProperty("java.version");
            javaVendor  = System.getProperty("java.vendor");
            osName      = System.getProperty("os.name");
            osArch      = System.getProperty("os.arch");
            osVersion   = System.getProperty("os.version");
        } catch (Throwable t) {
            // !!!
        }

        try {
            if (sshHomeDir == null) {
                String hDir = System.getProperty("user.home");
                if (hDir == null)
                    hDir = System.getProperty("user.dir");
                if (hDir == null)
                    hDir = System.getProperty("java.home");

                sshHomeDir = hDir + File.separator + "mindterm";
                File f = new File(sshHomeDir);
                if (!f.exists()) {
                    if (osName.toLowerCase().startsWith("win")) {
                        sshHomeDir = hDir + File.separator + "Application Data";
                        f = new File(sshHomeDir);
                        if (!f.exists())
                            sshHomeDir = hDir;
                        sshHomeDir += File.separator + "MindTerm";
                    } else {
                        sshHomeDir = hDir + File.separator + ".mindterm";
                    }
                }
                sshHomeDir += File.separator;
            }
        } catch (Throwable t) {
            // !!!
        }
    }

    public void initGUI() {
        GUI.setLookAndFeel();
        if (separateFrame) {
            frame = new JFrame();
            frame.addWindowListener(this);
            container = frame;
        } else {
            container = getContentPane();
        }

        term = new TerminalWin(container, termProps, (sshClone == null));
        if(mergedTermProps)
            term.setPropsChanged(true);

        client.setDialogParent(container);

        if(haveMenus) {
            SSHMenuHandler      menus;
            TerminalMenuHandler tmenus;
            try {
                menus = new SSHMenuHandlerFull();
                menus.init(this, client, container, term);
                tmenus = new TerminalMenuHandlerFull();
                tmenus.setTerminalWin(term);
                term.setMenus(tmenus);
                client.setMenus(menus);
                if (usePopMenu) {
                    menus.preparePopupMenu();
                } else {
                    JMenuBar menuBar = new JMenuBar();
                    if (separateFrame) {
                        frame.setJMenuBar(menuBar);
                    } else {
                        setJMenuBar(menuBar);
                    }
                    menus.prepareMenuBar(menuBar);
                }
                tmenus.setTerminalMenuListener(menus);
                term.setClipboard(GlobalClipboard.getClipboardHandler(tmenus));
            } catch (Throwable t) {
                t.printStackTrace();
                System.out.println("Full menus can't be enabled since classes "
                                   + "are missing");
                term.setMenus(null);
                client.setMenus(null);
                term.setClipboard(GlobalClipboard.getClipboardHandler());
            }
        } else {
            term.setClipboard(GlobalClipboard.getClipboardHandler());
        }

        term.addAsEntropyGenerator(client.randomSeed());

        if (separateFrame) {
            term.setIgnoreClose();
            container.setLayout(new BorderLayout());
            container.add(term.getPanelWithScrollbar(), BorderLayout.CENTER);
            frame.pack();
            frame.setVisible(true);
        } else {
            container.add(term.getPanelWithScrollbar());
            synchronized(initLock) {
                initLock.notify();
            }
        }

        term.requestFocus();
    }

    public void doExit() {
        System.out.println("Thank you for using MindTerm...");
        if(!separateFrame && term != null) {
            term.clearScreen();
            term.setAttributeBold(true);
            term.write("Thank you for using MindTerm...");
        }
        if(!weAreAnApplet) {
            System.exit(0);
        }
    }

    boolean confirmedClose = false;
    public boolean confirmClose() {
        if(client != null && !confirmedClose) {
            try {
                client.getPropertyHandler().checkSave();
            } catch(IOException ee) {
                client.alert("Error saving settings: " + ee.getMessage());
            }
            if(client.isOpened() &&
                    !client.askConfirmation(
                        "Do you really want to disconnect from " +
                        client.getPropertyHandler().getProperty("server") + "?",
                        false)) {
                confirmedClose = false;
            } else {
                confirmedClose = true;
            }
        }
        return confirmedClose;
    }

    void initParams(MindTerm mindterm) {
        this.sshHomeDir     = mindterm.sshHomeDir;
        this.propsFile      = mindterm.propsFile;
        this.usePopMenu     = mindterm.usePopMenu;
        this.haveMenus      = mindterm.haveMenus;
        this.haveGUI        = mindterm.haveGUI;
        this.exitOnLogout   = mindterm.exitOnLogout;
        this.quiet          = mindterm.quiet;
        this.separateFrame  = true;
        this.weAreAnApplet  = mindterm.weAreAnApplet;
        this.autoLoadProps  = mindterm.autoLoadProps;
        this.popButtonNum   = mindterm.popButtonNum;
    }

    public void cloneWindow() {
        MindTerm mindterm = new MindTerm(this.sshProps, this.termProps);
        mindterm.initParams(this);
        mindterm.sshClone = this.client;
        (new Thread(mindterm, "MindTerm.clone")).start();
    }

    public void newWindow() {
        MindTerm mindterm = new MindTerm(paramSSHProps, paramTermProps);
        mindterm.initParams(this);
        (new Thread(mindterm, "MindTerm.window")).start();
    }

    @SuppressWarnings("deprecation")
	public void destroy() {
        Enumeration<MindTerm> e = terminals.elements();
        while(e.hasMoreElements()) {
            MindTerm mt = e.nextElement();
            if(mt.client != null && mt.client.isSSH2) {
                mt.client.transport.normalDisconnect("User exited");
            }
            if(mt.clientThread != null) {
                mt.clientThread.stop();
            }
        }
    }

    @SuppressWarnings("deprecation")
	public void close() {
        if(!confirmClose())
            return;
        if(client.isSSH2) {
            client.transport.normalDisconnect("User closed connection");
        }
        if(clientThread != null) {
            clientThread.stop();
        }
    }

    public void exit() {
        if(!confirmClose())
            return;
        destroy();
    }

    @SuppressWarnings("deprecation")
	public synchronized void windowClosing(WindowEvent e) {
        if(isClosing)
            return;
        isClosing = true;

        if(!confirmClose()) {
            isClosing = false;
            return;
        }

        if(separateFrame && haveGUI && frame != null) {
            frame.dispose();
        }

        if(clientThread != null && clientThread.isAlive())
            clientThread.stop();

        removeTerminal(this);
    }

    public void windowDeiconified(WindowEvent e) {}
    public void windowOpened(WindowEvent e) {}
    public void windowClosed(WindowEvent e) {}
    public void windowIconified(WindowEvent e) {}
    public void windowActivated(WindowEvent e) {}
    public void windowDeactivated(WindowEvent e) {}
}
