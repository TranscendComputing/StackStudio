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

package com.mindbright.ssh;

import java.awt.BorderLayout;
import java.awt.CardLayout;
import java.awt.Component;
import java.awt.Dimension;
import java.awt.FlowLayout;
import java.awt.GridBagConstraints;
import java.awt.GridBagLayout;
import java.awt.Insets;

import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.ItemEvent;
import java.awt.event.ItemListener;
import java.awt.event.KeyEvent;

import java.io.File;

import java.util.Arrays;

import javax.swing.BorderFactory;
import javax.swing.Box;
import javax.swing.JButton;
import javax.swing.JCheckBox;
import javax.swing.JCheckBoxMenuItem;
import javax.swing.JComboBox;
import javax.swing.JDialog;
import javax.swing.JLabel;
import javax.swing.JList;
import javax.swing.JMenu;
import javax.swing.JMenuBar;
import javax.swing.JMenuItem;
import javax.swing.JPanel;
import javax.swing.JPasswordField;
import javax.swing.JPopupMenu;
import javax.swing.JScrollPane;
import javax.swing.JTabbedPane;
import javax.swing.JTextArea;
import javax.swing.JTextField;
import javax.swing.KeyStroke;
import javax.swing.ListSelectionModel;
import javax.swing.ScrollPaneConstants;
import javax.swing.SwingConstants;

import javax.swing.border.TitledBorder;

import javax.swing.event.ListSelectionEvent;
import javax.swing.event.ListSelectionListener;

import com.mindbright.application.MindTerm;
import com.mindbright.application.MindTermModule;

import com.mindbright.gui.GUI;

import com.mindbright.ssh2.SSH2ListUtil;
import com.mindbright.ssh2.SSH2Preferences;

import com.mindbright.terminal.TerminalMenuHandlerFull;
import com.mindbright.terminal.TerminalMenuListener;
import com.mindbright.terminal.TerminalWin;

import com.mindbright.util.Crypto;
import com.mindbright.util.Util;

public class SSHMenuHandlerFull extends SSHMenuHandler implements 
        ActionListener,
        ItemListener,
        TerminalMenuListener {

    private final static String aboutText =
        Version.licenseMessage + "\n" +
        "\n" +
        Version.copyright + "\n" +
        "\thttp://www.cryptzone.com/products/agmindterm/\n" +
        "\n" +
        "This product includes cryptographic software written by,\n" +
        "Eric Young (eay@cryptsoft.com)\n" +
        "\n" +
        "JVM vendor:\t" + MindTerm.javaVendor  + "\n" +
        "JVM version:\t" + MindTerm.javaVersion  + "\n" +
        "OS name:\t" + MindTerm.osName  + "\n" +
        "OS arch.:\t" + MindTerm.osArch  + "\n" +
        "OS version:\t" + MindTerm.osVersion  + "\n";


    private final static int ACT_MOD_BASE = 0;

    private class Actions implements ActionListener {
	private int       action;

	public Actions(int action) {
	    this.action = action;
	}

	public void actionPerformed(ActionEvent e) {
            if(action >= ACT_MOD_BASE)
                modules[action - ACT_MOD_BASE].activate(client);
	}
    }

    protected Component          parent;
    protected MindTerm           mindterm;
    private SSHInteractiveClient client;
    private TerminalWin          term;
    private MindTermModule[]     modules;
    private int                  modCnt;
    private SSHPropertyHandler   ph;

    private final static int MENU_FILE     = 0;
    private final static int MENU_SETTINGS = 1;
    private final static int MENU_TUNNELS  = 2;
    private final static int MENU_HELP     = 3;

    private final static int M_FILE_NEW          = 1;
    private final static int M_FILE_CLONE        = 2;
    private final static int M_FILE_CONN         = 3;
    private final static int M_FILE_DISC         = 4;
    private final static int M_FILE_LOAD         = 6;
    private final static int M_FILE_SAVE         = 7;
    private final static int M_FILE_SAVEAS       = 8;
    private final static int M_FILE_CREATID      = 10;
    private final static int M_FILE_EDITPKI      = 11;
    private final static int M_FILE_PRINT_SCREEN = 13;
    private final static int M_FILE_PRINT_BUFFER = 14;
    private final static int M_FILE_CAPTURE      = 16;
    private final static int M_FILE_SEND         = 17;
    private final static int M_FILE_CLOSE        = 19;
    private final static int M_FILE_EXIT         = 20;

    private final static int M_SET_SSH_NEW  = 1;
    private final static int M_SET_SSH_PREF = 2;

    private final static int M_SET_TERM     = 3;

    private final static int M_SET_RESET    = 4;
    private final static int M_SET_AUTOSAVE = 6;
    private final static int M_SET_AUTOLOAD = 7;
    private final static int M_SET_SAVEPWD  = 8;

    private final static int M_TUNL_SETUP    = 1;
    private final static int M_TUNL_CURRENT  = 3;

    private final static int M_HELP_ABOUT   = 1;

    private final static String MENU_HEADER_POPUP   = "MindTerm Menu";
    private final static String MENU_HEADER_PLUGINS = "Plugins";

    private final static String[][] menuTexts = {
	{ "File",
	  "New Terminal", "Clone Terminal", "Connect...", "Disconnect", null,
	  "Load Settings...", "Save Settings", "Save Settings As...", null,
	  "Create Keypair...", "Edit/Convert Keypair...", null,
          "Print screen...", "Print buffer...", null,
	  "_Capture To File...", "Send ASCII File...", null, "Close", "Exit"
	},

	{ "Settings",
	  "New Server...", "Connection...", 
          "Terminal...", "Reset To Defaults", null,
	  "_Auto Save Settings", "_Auto Load Settings", "_Save Passwords"
	},

	{ "Tunnels",
	  "Setup...", null, "Current Connections..."
	},

	{ "Help",
	  "About MindTerm"
	},
    };

    private final static int NO_SHORTCUT = -1;
    private final static int[][] menuShortCuts = {
	{ NO_SHORTCUT, KeyEvent.VK_N, KeyEvent.VK_O, KeyEvent.VK_C, NO_SHORTCUT,
	  NO_SHORTCUT, NO_SHORTCUT, KeyEvent.VK_S, NO_SHORTCUT, NO_SHORTCUT, NO_SHORTCUT, 
	  NO_SHORTCUT, NO_SHORTCUT, NO_SHORTCUT, NO_SHORTCUT,
	  NO_SHORTCUT, KeyEvent.VK_E, KeyEvent.VK_X },

	{ NO_SHORTCUT, KeyEvent.VK_H, NO_SHORTCUT, KeyEvent.VK_T }
    };

    private static int getMenuShortCut(int m, int s) {
        if (m < 0 || s < 0) return NO_SHORTCUT;
        if (menuShortCuts.length <= m) return NO_SHORTCUT;
        if (menuShortCuts[m].length <= s) return NO_SHORTCUT;
        return menuShortCuts[m][s];
    }

    private static String LBL_SAVE_AS_ALIAS = "Save as alias";
    private static String LBL_CUSTOM_LIST   = "custom list...";
    private static String LBL_ANY_STANDARD  = "any standard";
    private static String LBL_X11_FORWARD   = "X11 forward";
    private static String LBL_SEND_KEEP     = "Send keep-alive";
    private static String LBL_STRICT        = "Strict host verify";
    private static String LBL_ALLOC_PTY     = "Allocate PTY";
    private static String LBL_KEY_NOISE     = "Key timing noise";
    
    private static String LBL_SERVER      = "Server";
    private static String LBL_PORT        = "Port";
    private static String LBL_USERNAME    = "Username";
    private static String LBL_AUTH        = "Authentication";
    private static String LBL_AUTH_REQ    = "Authentication required";
    private static String LBL_PASSWORD    = "Password";
    private static String LBL_MODIFY_LIST = "Modify list";
    private static String LBL_IDENTITY    = "Identity";
    private static String LBL_HOST_KEY    = "Host key";
    private static String LBL_PROTOCOL    = "Protocol";
    private static String LBL_PROTO_SSH1  = "SSHv1";
    private static String LBL_PROTO_SSH2  = "SSHv2";
    private static String LBL_HKEY_TYPE   = "Host key type";
    private static String LBL_HKEY_DSA    = "DSA";
    private static String LBL_HKEY_RSA    = "RSA";
    private static String LBL_HKEY_ECDSA  = "ECDSA";
    private static String LBL_C2S         = "Client to Server";
    private static String LBL_S2C         = "Server to Client";
    private static String LBL_CIPHER      = "Cipher";
    private static String LBL_MAC         = "Mac";
    private static String LBL_COMP        = "Compression";
    private static String LBL_LOCAL_DISP  = "Local display";
    private static String LBL_INTERVAL    = "Interval";
    private static String LBL_SECONDS    = "(s)";
    private static String LBL_CURR_TUNNELS = "Currently open tunnels";
    private static String LBL_PROXY_TYPE  = "Proxy type";
    
    
    private static String LBL_BTN_OK      = "OK";
    private static String LBL_BTN_DISMISS = "Dismiss";
    private static String LBL_BTN_CANCEL  = "Cancel";
    private static String LBL_BTN_CONNECT = "Connect";
    private static String LBL_BTN_BROWSE  = "Browse...";
    private static String LBL_BTN_CLOSE_TUNNEL = "Disconnect";
    private static String LBL_BTN_REFRESH = "Refresh";
    private static String LBL_TAB_GENERAL  = "General";
    private static String LBL_TAB_PROXY    = "Proxy";
    private static String LBL_TAB_SECURITY = "Security";
    private static String LBL_TAB_FEATURES = "Features";

    private static int IDX_TAB_GENERAL     = 0;
    private static int IDX_TAB_SECURITY    = 2;
    private static String ERR_NO_PROTOCOL  = "No protocol version selected";
    private static String ERR_NO_KEYTYPE   = "No host key type selected";

    private Object[][] menuItems;
    private JMenuItem[] modMenuItems;

    // General stuff
    private JComboBox   comboAuthTyp, comboSrv;
    private JCheckBox   cbSaveAlias;
    private JTextField  textUser, textAlias, textPrivateKey, textPrivateHostKey;
    private JPasswordField textPwd;
    private JButton     customBtn;
    private CardLayout  authLabelCL, authCL;
    private JPanel      authLabelCP, authCP;
    private String      customAuth;

    // Proxy stuff
    private JComboBox   comboPrxType;
    private JCheckBox   cbNeedAuth;
    private JTextField  textPrxHost, textPrxPort, textPrxUser;
    private JPasswordField textPrxPasswd;

    // Security stuff
    private JCheckBox cbProto1, cbProto2;
    private JCheckBox cbKeyTypeDSA, cbKeyTypeRSA, cbKeyTypeECDSA;
    private JComboBox comboCipherC2S, comboCipherS2C, comboMacC2S, comboMacS2C;
    private JComboBox comboCompC2S, comboCompS2C;
    private JCheckBox cbX11, cbIdHost, cbKeyNoise, cbAlive, cbForcPty;
    private JTextField textDisp, textAlive;

    // Do not trigger on events while populating
    private boolean ignoreEvents = false;

    private static String[] ciphers, macs;

    private static final String[] compc2s  = { "none", "low", "medium", "high" };
    private static final String[] comps2c  = { "none", "medium" };
    private static final String[] lvl2comp = { "none", "low", "low", "low",
                                                 "medium", "medium", "medium",
                                                 "high", "high", "high" };
    private static final int[]    comp2lvl = { 0, 2, 6, 9 };


    private final static String[] AUTH_METHODS = { "password", "publickey",
                                                     "securid", "cryptocard",
                                                     "tis", "kbd-interact",
                                                     "hostbased", "gssapi-with-mic",
                                                     "custom list..." };

    private JCheckBox[] authMethod;
    private JList tunnelsList;
    private String firstAlias = null;

    public void init(MindTerm mindterm, SSHInteractiveClient client,
                     Component parent, TerminalWin term) {
	this.mindterm     = mindterm;
	this.client       = client;
	this.parent       = parent;
	this.term         = term;
	this.modCnt       = 0;
        this.ph           = client.propsHandler;

        int i;
        
        if (client.propsHandler.getPropertyB("menu.modules.disable")) {
            return;
        }
        for (i=0; ; i++) {
	    String className = client.propsHandler.getProperty("module" + i);
	    if (className == null) {
                modCnt = i+1;
                modules = new MindTermModule[modCnt];
                break;
            }
        }        
            
	for(i = 0; i < modCnt; i++) {
	    String className = client.propsHandler.getProperty("module" + i);
	    if (className == null)
		break;
	    try {
		modules[i] = (MindTermModule)Class.forName(className).newInstance();
		modules[i].init(client);
	    } catch (Exception e) {
		alertDialog("Module class '" + className + "' not found");
	    }
	}
    }

    private boolean isFipsMode() {
        return com.mindbright.util.Crypto.isFipsMode();
    }
    
    private void initCiphers() {
        if (ciphers == null) {
            ciphers = SSH2ListUtil.arrayFromList(SSHPropertyHandler.ciphAlgsSort);
            macs    = SSH2ListUtil.arrayFromList(SSHPropertyHandler.macAlgs);            
        }
    }

    private int popButtonNum = 3;
    public void setPopupButton(int popButtonNum) {
	term.setPopupButton(popButtonNum);
	this.popButtonNum = popButtonNum;
    }

    public int getPopupButton() {
	return popButtonNum;
    }

    private String getModuleLabel(int module) {
	return client.propsHandler.getProperty("module" + module + ".label");
    }

    protected void modulesConnect() {
        if (modules == null) return;
	for(int i = 0; i < modules.length; i++)
            if (modules[i] != null)
                modules[i].connected(client);
    }

    private int[] mapAction(String action) {
	int[] id = new int[2];
	int i = 0, j = 0;

	for(i = 0; i < menuTexts.length; i++) {
	    for(j = 1; j < menuTexts[i].length; j++) {
		String mt = menuTexts[i][j];
		if(mt != null && 
                   (action.equals(mt) ||
                    ("_" + action).equals(mt))) {
		    id[0] = i;
		    id[1] = j;
		    i = menuTexts.length;
		    break;
		}
	    }
	}
	return id;
    }

    public void actionPerformed(ActionEvent e) {
	handleMenuAction(mapAction(getMenuLabel(e.getSource())));
    }

    public void itemStateChanged(ItemEvent e) {
	handleMenuAction(mapAction((String)e.getItem()));
    }

    private void handleMenuAction(int[] id) {
	switch(id[0]) {
            case MENU_FILE:
                switch(id[1]) {
                    case M_FILE_NEW:
                        mindterm.newWindow();
                        break;
                    case M_FILE_CLONE:
                        mindterm.cloneWindow();
                        break;
                    case M_FILE_CONN:
                        initCiphers();
                        connectDialog("MindTerm - Connect");
                        break;
                    case M_FILE_DISC:
                        if(mindterm.confirmClose()) {
                            client.forcedDisconnect();
                            client.quiet = client.initQuiet;
                        }
                        break;
                    case M_FILE_LOAD:
                        loadFileDialog();
                        break;
                    case M_FILE_SAVE:
                        try {
                            if(client.propsHandler.savePasswords &&
                               client.propsHandler.emptyPropertyPassword()) {
                                String pwd = setPasswordDialog(
                                    "Please set password for alias " +
                                    client.propsHandler.currentAlias,
                                    "MindTerm - Set File Password");
                                if(pwd == null)
                                    return;
                                client.propsHandler.setPropertyPassword(pwd);
                            }
                            client.propsHandler.saveCurrentFile();
                        } catch (Throwable t) {
                            alertDialog("Error saving settings: " + t.getMessage());
                        }
                        break;
                    case M_FILE_SAVEAS:
                        saveAsFileDialog();
                        break;
                    case M_FILE_CREATID:
                        keyGenerationDialogCreate();
                        break;
                    case M_FILE_EDITPKI:
                        keyGenerationDialogEdit();
                        break;
                    case M_FILE_CAPTURE:
                        if(getState(MENU_FILE, M_FILE_CAPTURE)) {
                            if(!((TerminalMenuHandlerFull)term.getMenus()).captureToFileDialog()) {
                                setState(MENU_FILE, M_FILE_CAPTURE, false);
                            }
                        } else {
                            ((TerminalMenuHandlerFull)term.getMenus()).endCapture();
                        }
                        break;
                    case M_FILE_SEND:
                        ((TerminalMenuHandlerFull)term.getMenus()).sendFileDialog();
                        break;
                    case M_FILE_PRINT_SCREEN:
                        ((TerminalMenuHandlerFull)term.getMenus()).printScreen();
                        break;
                    case M_FILE_PRINT_BUFFER:
                        ((TerminalMenuHandlerFull)term.getMenus()).printBuffer();
                        break;
                    case M_FILE_CLOSE:
                        mindterm.close();
                        break;
                    case M_FILE_EXIT:
                        mindterm.exit();
                        break;
                }
                break;

            case MENU_SETTINGS:
                switch(id[1]) {
                    case M_SET_SSH_NEW:
                        sshNewServerDialog();
                        break;
                    case M_SET_SSH_PREF:
                        sshPreferencesDialog();
                        break;
                    case M_SET_TERM:
                        ((TerminalMenuHandlerFull)term.getMenus()).termSettingsDialog();
                        break;
                    case M_SET_RESET:
                        client.propsHandler.resetToDefaults();
                        break;
                    case M_SET_AUTOSAVE:
                        client.propsHandler.setAutoSaveProps
                            (getState(MENU_SETTINGS, M_SET_AUTOSAVE));
                        update();
                        break;
                    case M_SET_AUTOLOAD:
                        client.propsHandler.setAutoLoadProps
                            (getState(MENU_SETTINGS, M_SET_AUTOLOAD));
                        update();
                        break;
                    case M_SET_SAVEPWD:
                        client.propsHandler.setSavePasswords
                            (getState(MENU_SETTINGS, M_SET_SAVEPWD));
                        if(client.propsHandler.savePasswords && 
                           client.propsHandler.emptyPropertyPassword() &&
                           client.propsHandler.getAlias() != null) {
                            String pwd = setPasswordDialog(
                                "Please set password for alias " +
                                client.propsHandler.currentAlias,
                                "MindTerm - Set File Password");
                            if(pwd == null) {
                                client.propsHandler.setSavePasswords(false);
                                update();
                                return;
                            }
                            client.propsHandler.setPropertyPassword(pwd);
                        }
                        break;
                }
                break;

            case MENU_TUNNELS:
                switch(id[1]) {
                    case M_TUNL_SETUP:
                        setupTunnelsDialog();
                        break;
                    case M_TUNL_CURRENT:
                        currentTunnelsDialog();
                        break;
                }
                break;

            case MENU_HELP:
                switch(id[1]) {
                    case M_HELP_ABOUT:
                        String ver = SSH.VER_MINDTERM;
                        if (com.mindbright.util.Crypto.isFipsMode())
                            ver += "_FIPS";
                        aboutDialog(parent, client, "About " + ver, 
                                    ver + "\n" + aboutText);
                        break;
                }
                break;
	}
    }

    private void setEnabled(int i, int j, boolean v) {
        if (menuItems[i] != null && menuItems[i][j] != null) {
            ((JMenuItem)menuItems[i][j]).setEnabled(v);
        }
    }

    private void setState(int i, int j, boolean v) {
        ((JCheckBoxMenuItem)menuItems[i][j]).setSelected(v);
    }

    private boolean getState(int i, int j) {
        return ((JCheckBoxMenuItem)menuItems[i][j]).isSelected();
    }

    private void updatePluginMenu() {
	for (int i = 0; i < modCnt; i++)
	    if (getModuleLabel(i) != null)
		modMenuItems[i].setEnabled(modules[i].isAvailable(client));
    }

    private String getMenuLabel(Object o) {
        return ((JMenuItem)o).getText();
    }

    public void prepareMenuBar(JMenuBar mb) {
	mb.add(getMenu(MENU_FILE));
	mb.add((JMenuItem) ((TerminalMenuHandlerFull)term.getMenus()).getMenu
               (TerminalMenuHandlerFull.MENU_EDIT));
	mb.add(getMenu(MENU_SETTINGS));
	JMenu pm = getPluginMenu();
	if (pm != null)
	    mb.add(pm);
        if (!ph.getPropertyB("menu.tunnels.disable")) {
            mb.add(getMenu(MENU_TUNNELS));
        }
	mb.add(getMenu(MENU_HELP));
	term.updateMenus();
    }

    public void preparePopupMenu() {
        JPopupMenu popupmenu = new JPopupMenu(MENU_HEADER_POPUP);
	havePopupMenu = true;
	popupmenu.add(getMenu(MENU_FILE));
	popupmenu.add(
            ((TerminalMenuHandlerFull)term.getMenus()).getMenu
            (TerminalMenuHandlerFull.MENU_EDIT));
	popupmenu.add(getMenu(MENU_SETTINGS));
	JMenu pm = getPluginMenu();
	if (pm != null) {
	    popupmenu.add(pm);
	}
        if (!ph.getPropertyB("menu.tunnels.disable")) {
            popupmenu.add(getMenu(MENU_TUNNELS));
        }
	popupmenu.addSeparator();
	popupmenu.add(getMenu(MENU_HELP));
        term.getMenus().setPopupMenu(popupmenu);
	update();
    }    

    private JMenu getMenu(int idx) {
	JMenu m = new JMenu(menuTexts[idx][0]);
	int len = menuTexts[idx].length;
	JMenuItem mi;
	String   t;

	if (menuItems == null)
	     menuItems = new Object[menuTexts.length][];
	if (menuItems[idx] == null)
	    menuItems[idx] = new Object[menuTexts[idx].length];

	for (int i = 1; i < len; i++) {
	    t = menuTexts[idx][i];
	    if (t == null) {
		m.addSeparator();
		continue;
	    }

	    if (t.charAt(0) == '_') {
		t = t.substring(1);
		mi = new JCheckBoxMenuItem(t);
		((JCheckBoxMenuItem)mi).addActionListener(this);
	    } else {
		mi = new JMenuItem(t);
		mi.addActionListener(this);
	    }

            int sc = getMenuShortCut(idx, i);
 	    if (sc != NO_SHORTCUT) {
 		mi.setAccelerator
                    (KeyStroke.getKeyStroke
                     (sc,
                      java.awt.Toolkit.getDefaultToolkit().getMenuShortcutKeyMask() | 
                      java.awt.event.InputEvent.SHIFT_MASK));
 	    }

	    menuItems[idx][i] = mi;
	    m.add(mi);
	}
	return m;
    }

    private JMenu getPluginMenu() {
        modMenuItems = null;
	JMenu m = null;
	if (modCnt > 0) {
            modMenuItems = new JMenuItem[modCnt];
	    m = new JMenu(MENU_HEADER_PLUGINS);
	    int i = 0;
	    for (; i < modCnt; i++) {
		String label = getModuleLabel(i);
		if (label != null) {
		    JMenuItem mi = new JMenuItem(label);
	    	    modMenuItems[i] = mi;
		    mi.addActionListener(new Actions(ACT_MOD_BASE + i));
		    m.add(mi);
		}
	    }
	    if (i == 0) m = null;
	}
	return m;
    }

    public void update() {
	boolean isOpen      = client.isOpened();
	boolean isConnected = client.isConnected();
	boolean hasHomeDir  = (client.propsHandler.getSSHHomeDir() != null);
        boolean allowNew =client.propsHandler.getPropertyB("allow-new-server");

	setEnabled(MENU_FILE, M_FILE_NEW, allowNew);
	setEnabled(MENU_FILE, M_FILE_CLONE, isOpen);
	setEnabled(MENU_FILE, M_FILE_SEND, isOpen);
	setEnabled(MENU_FILE, M_FILE_SAVEAS, isOpen && hasHomeDir);
	setEnabled(MENU_FILE, M_FILE_CONN, !isConnected && allowNew);
	setEnabled(MENU_FILE, M_FILE_DISC, isConnected);
	setEnabled(MENU_FILE, M_FILE_LOAD, !isConnected && allowNew);
	setEnabled(MENU_FILE, M_FILE_SAVE, 
                   client.propsHandler.wantSave() &&
                   client.propsHandler.currentAlias != null);
        
	setEnabled(MENU_SETTINGS, M_SET_SSH_NEW, !isOpen && allowNew);
	setEnabled(MENU_SETTINGS, M_SET_SSH_PREF, isOpen);
	setEnabled(MENU_SETTINGS, M_SET_RESET, !isOpen);

	setEnabled(MENU_SETTINGS, M_SET_AUTOSAVE, hasHomeDir);
	setEnabled(MENU_SETTINGS, M_SET_AUTOLOAD, hasHomeDir);
	setEnabled(MENU_SETTINGS, M_SET_SAVEPWD, hasHomeDir);

	setState(MENU_SETTINGS, M_SET_AUTOSAVE,
                 client.propsHandler.autoSaveProps);
	setState(MENU_SETTINGS, M_SET_AUTOLOAD,
                 client.propsHandler.autoLoadProps);
	setState(MENU_SETTINGS, M_SET_SAVEPWD,
                 client.propsHandler.savePasswords);

	setEnabled(MENU_TUNNELS, M_TUNL_CURRENT, isOpen);
	setEnabled(MENU_TUNNELS, M_TUNL_SETUP, isOpen);

	updatePluginMenu();
    }

    public void close() {
	// !!! TODO, note that this can only be generated in SSH2 clone window now
	// so we don't need to care about this...
    }

    private void sshPreferencesDialog() {
        initCiphers();
        sshPreferencesDialog("MindTerm - SSH Preferences");
    }

    private void sshNewServerDialog(String title) {
        sshConfigDialog(title, IDX_TAB_GENERAL);
    }
    private final void sshNewServerDialog() {
        initCiphers();
        sshNewServerDialog("MindTerm - New Server");
    }

    public void sshPreferencesDialog(String title) {
        sshConfigDialog(title, IDX_TAB_SECURITY);
    }

    private final void currentTunnelsDialog() {
        currentTunnelsDialog("MindTerm - Currently Open Tunnels");
    }
    public final void currentTunnelsDialog(String title) {
        final JDialog dialog = GUI.newBorderJDialog(parent, title, false);

        dialog.getContentPane().add(
            new JLabel(LBL_CURR_TUNNELS), BorderLayout.NORTH);
        
        tunnelsList = new JList();
        tunnelsList.setVisibleRowCount(8);
        tunnelsList.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);

        JScrollPane sp = new JScrollPane(tunnelsList);
        dialog.getContentPane().add(sp, BorderLayout.CENTER);
        
        ActionListener al = new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                String cmd = e.getActionCommand();
                if ("close".equals(cmd)) {
                    int i = tunnelsList.getSelectedIndex();
                    if (i == -1) {
                        term.ringBell();
                        return;
                    }
                    client.closeTunnelFromList(i);
                    Thread.yield();
                } else if ("refresh".equals(cmd)) {
                    // Nothing to do, the refresh happens below
                }
                refreshCurrList();
            }
        };

        final JButton close   = new JButton(LBL_BTN_CLOSE_TUNNEL);
        JButton refresh = new JButton(LBL_BTN_REFRESH);
        JButton cancel  = new JButton(LBL_BTN_DISMISS);

        ListSelectionListener ll = new ListSelectionListener() {
            public void valueChanged(ListSelectionEvent e) {
                int i = tunnelsList.getSelectedIndex();
                close.setEnabled(i >= 0);
            }
        };
        tunnelsList.addListSelectionListener(ll);
        
        close.setActionCommand("close");
        close.addActionListener(al);
        close.setEnabled(false);
        refresh.setActionCommand("refresh");
        refresh.addActionListener(al);
        
        dialog.getContentPane().add(GUI.newButtonPanel
                   (new JButton[] { close, refresh, cancel }),
                   BorderLayout.SOUTH);

        cancel.addActionListener(new GUI.CloseAction(dialog));
        
        dialog.setResizable(true);
        dialog.pack();

        refreshCurrList();
    
	GUI.placeDialog(dialog);
	tunnelsList.requestFocus();
        dialog.addWindowListener(GUI.getWindowDisposer());        
	dialog.setVisible(true);
    }

    private void refreshCurrList() {
        tunnelsList.setListData(client.listTunnels());
        tunnelsList.setSelectedIndex(0);
    }

    private void setupTunnelsDialog(String title) {
        SSHTunnelDialog.show(title, client, ph, parent);
    }
    private final void setupTunnelsDialog() {
        setupTunnelsDialog("MindTerm - Tunnel Setup");
    }

    public void connectDialog(String title) {
        sshConfigDialog(title, IDX_TAB_GENERAL);
    }

    private void sshConfigDialog(String title, int first) {
        final JDialog dialog = GUI.newJDialog(parent, title, true);

        GridBagLayout      grid  = new GridBagLayout();
        GridBagConstraints gridc = new GridBagConstraints();
        gridc.fill   = GridBagConstraints.HORIZONTAL;
        gridc.anchor = GridBagConstraints.WEST;
        gridc.insets = new Insets(2,2,2,2);
        gridc.gridheight = 1;
        gridc.weightx = 0.0;
        gridc.weighty = 0.0;

        JTabbedPane tp = new JTabbedPane();

        ItemListener ilserv = new ItemListener() {
            public void itemStateChanged(ItemEvent e) {
                if (!ignoreEvents) {
                    serverSelected();
                }
            }
        };
        ItemListener ilg = new ItemListener() {
            public void itemStateChanged(ItemEvent e) {
                updateChoicesGeneral();
            }
        };
        ItemListener ilp = new ItemListener() {
            public void itemStateChanged(ItemEvent e) {
                updateChoicesProxy(e);
            }
        };
        ItemListener ils = new ItemListener() {
            public void itemStateChanged(ItemEvent e) {
                updateChoicesSecurity(e);
            }
        };
        ItemListener ilf = new ItemListener() {
            public void itemStateChanged(ItemEvent e) {
                updateChoicesFeatures();
            }
        };

        /****************************************************************
         * General tab
         */
        JPanel mp = new JPanel(grid);
        
        JLabel lbl = new JLabel(LBL_SERVER, SwingConstants.RIGHT);
        gridc.gridwidth = 1;
        mp.add(lbl, gridc);
        comboSrv = new JComboBox(getAvailableAliases());
        comboSrv.setSelectedItem(getFirstAlias());
        comboSrv.setEditable(true);
        comboSrv.addItemListener(ilserv);
        gridc.gridwidth = GridBagConstraints.REMAINDER;
        gridc.weightx = 1.0;
        mp.add(comboSrv, gridc);
        gridc.weightx = 0.0;
        
        lbl = new JLabel(LBL_USERNAME, SwingConstants.RIGHT);
        gridc.gridwidth = 1;
        mp.add(lbl, gridc);
        textUser = new JTextField("", 12);
        gridc.gridwidth = GridBagConstraints.REMAINDER;
        mp.add(textUser, gridc);

        lbl = new JLabel(LBL_AUTH, SwingConstants.RIGHT);
        gridc.gridwidth = 1;
        mp.add(lbl, gridc);
        comboAuthTyp = new JComboBox(AUTH_METHODS);
        comboAuthTyp.addItemListener(ilg);
        gridc.gridwidth = GridBagConstraints.REMAINDER;
        gridc.fill = GridBagConstraints.NONE;
        mp.add(comboAuthTyp, gridc);
        gridc.fill = GridBagConstraints.HORIZONTAL;
        
        gridc.gridwidth = 1;
        mp.add(getAuthLabel(), gridc);
        gridc.gridwidth = GridBagConstraints.REMAINDER;
        mp.add(getAuth(), gridc);

        cbSaveAlias = new JCheckBox(LBL_SAVE_AS_ALIAS);
        cbSaveAlias.addItemListener(ilg);
        gridc.insets = new Insets(10, 2, 2, 2);
        gridc.gridwidth = 1;
        mp.add(cbSaveAlias, gridc);
        textAlias = new JTextField("", 12);
        gridc.gridwidth = GridBagConstraints.REMAINDER;
        mp.add(textAlias, gridc);

        gridc.weighty = 1.0;
        mp.add(Box.createVerticalGlue(), gridc);
        gridc.weighty = 0.0;

        tp.addTab(LBL_TAB_GENERAL, mp);

        /****************************************************************
         * Proxy tab
         */
        mp = new JPanel(grid);

        lbl = new JLabel(LBL_PROXY_TYPE, SwingConstants.RIGHT);
        gridc.insets = new Insets(2, 2, 2, 2);
        gridc.gridwidth = 1;
        mp.add(lbl, gridc);
        comboPrxType = new JComboBox(SSH.getProxyTypes());
        comboPrxType.addItemListener(ilp);
        gridc.gridwidth = GridBagConstraints.REMAINDER;
        gridc.fill = GridBagConstraints.NONE;
        mp.add(comboPrxType, gridc);
        gridc.fill = GridBagConstraints.HORIZONTAL;

        lbl = new JLabel(LBL_SERVER, SwingConstants.RIGHT);
        gridc.gridwidth = 1;
        mp.add(lbl, gridc);
        textPrxHost = new JTextField("", 12);
        gridc.gridwidth = GridBagConstraints.REMAINDER;
        gridc.weightx = 1.0;
        mp.add(textPrxHost, gridc);
        gridc.weightx = 0.0;

        lbl = new JLabel(LBL_PORT, SwingConstants.RIGHT);
        gridc.gridwidth = 1;
        mp.add(lbl, gridc);
        textPrxPort = new JTextField("", 12);
        gridc.gridwidth = GridBagConstraints.REMAINDER;
        mp.add(textPrxPort, gridc);

        JPanel ap = new JPanel(new GridBagLayout());
	TitledBorder titleBorder 
	    = BorderFactory.createTitledBorder(BorderFactory.
					       createEtchedBorder());
	titleBorder.setTitle(LBL_AUTH_REQ);
	ap.setBorder(titleBorder);

        cbNeedAuth = new JCheckBox(LBL_AUTH);
        cbNeedAuth.addItemListener(ilp);
        ap.add(cbNeedAuth, gridc);

        lbl = new JLabel(LBL_USERNAME, SwingConstants.RIGHT);
        gridc.gridwidth = 1;
        ap.add(lbl, gridc);
        textPrxUser = new JTextField("", 12);
        gridc.gridwidth = GridBagConstraints.REMAINDER;
        gridc.weightx = 1.0;
        ap.add(textPrxUser, gridc);
        gridc.weightx = 0.0;

        lbl = new JLabel(LBL_PASSWORD, SwingConstants.RIGHT);
        gridc.gridwidth = 1;
        ap.add(lbl, gridc);
        textPrxPasswd = new JPasswordField("", 12);
        gridc.gridwidth = GridBagConstraints.REMAINDER;
        ap.add(textPrxPasswd, gridc);

        mp.add(ap, gridc);

        gridc.weighty = 1.0;
        mp.add(Box.createVerticalGlue(), gridc);
        gridc.weighty = 0.0;

        tp.addTab(LBL_TAB_PROXY, mp);

        /****************************************************************
         * Security tab
         */
        mp = new JPanel(grid);

        lbl = new JLabel(LBL_PROTOCOL, SwingConstants.RIGHT);
        gridc.gridwidth = 1;
        mp.add(lbl, gridc);
        cbProto2 = new JCheckBox(LBL_PROTO_SSH2);
        cbProto2.addItemListener(ils);
        mp.add(cbProto2, gridc);
        cbProto1 = new JCheckBox(LBL_PROTO_SSH1);
        gridc.gridwidth = GridBagConstraints.REMAINDER;
        mp.add(cbProto1, gridc);

        lbl = new JLabel(LBL_HKEY_TYPE, SwingConstants.RIGHT);
        gridc.gridwidth = 1;
        mp.add(lbl, gridc);
        cbKeyTypeDSA = new JCheckBox(LBL_HKEY_DSA);
        mp.add(cbKeyTypeDSA, gridc);
        JCheckBox cb = cbKeyTypeRSA = new JCheckBox(LBL_HKEY_RSA);
        if (Crypto.hasECDSASupport()) {
            mp.add(cbKeyTypeRSA, gridc);
            cb = cbKeyTypeECDSA = new JCheckBox(LBL_HKEY_ECDSA);
        }
        gridc.gridwidth = GridBagConstraints.REMAINDER;
        mp.add(cb, gridc);

        gridc.gridwidth = 1;
        mp.add(new JPanel(), gridc);
        gridc.gridwidth = 3;
        mp.add(new JLabel(LBL_C2S), gridc);
        gridc.gridwidth = GridBagConstraints.REMAINDER;
        mp.add(new JLabel(LBL_S2C), gridc);

        comboCipherC2S = new JComboBox(ciphers);
        comboCipherS2C = new JComboBox(ciphers);
        comboMacC2S    = new JComboBox(macs);
        comboMacS2C    = new JComboBox(macs);
        comboCompC2S   = new JComboBox(compc2s);
        comboCompS2C   = new JComboBox(comps2c);
        
        comboCipherC2S.insertItemAt(LBL_ANY_STANDARD, 0);
        comboCipherS2C.insertItemAt(LBL_ANY_STANDARD, 0);
        comboMacC2S.insertItemAt(LBL_ANY_STANDARD, 0);
        comboMacS2C.insertItemAt(LBL_ANY_STANDARD, 0);

        comboCipherC2S.addItemListener(ils);
        comboMacC2S.addItemListener(ils);
        comboCompC2S.addItemListener(ils);

        lbl = new JLabel(LBL_CIPHER, SwingConstants.RIGHT);
        gridc.gridwidth = 1;
        mp.add(lbl, gridc);
        gridc.gridwidth = 3;
        mp.add(comboCipherC2S, gridc);
        gridc.gridwidth = GridBagConstraints.REMAINDER;
        mp.add(comboCipherS2C, gridc);

        lbl = new JLabel(LBL_MAC, SwingConstants.RIGHT);
        gridc.gridwidth = 1;
        mp.add(lbl, gridc);
        gridc.gridwidth = 3;
        mp.add(comboMacC2S, gridc);
        gridc.gridwidth = GridBagConstraints.REMAINDER;
        mp.add(comboMacS2C, gridc);

        lbl = new JLabel(LBL_COMP, SwingConstants.RIGHT);
        gridc.gridwidth = 1;
        mp.add(lbl, gridc);
        gridc.gridwidth = 3;
        mp.add(comboCompC2S, gridc);
        gridc.gridwidth = GridBagConstraints.REMAINDER;
        mp.add(comboCompS2C, gridc);

        gridc.weighty = 1.0;
        mp.add(Box.createVerticalGlue(), gridc);
        gridc.weighty = 0.0;

        tp.addTab(LBL_TAB_SECURITY, mp);

        /****************************************************************
         * features tab
         */
        mp = new JPanel(grid);

        lbl = new JLabel(LBL_X11_FORWARD, SwingConstants.RIGHT);
        gridc.gridwidth = 1;
        mp.add(lbl, gridc);
        JPanel p = new JPanel(new FlowLayout(FlowLayout.LEFT, 0, 0));
        cbX11 = new JCheckBox();
        cbX11.addItemListener(ilf);
        textDisp = new JTextField("", 12);
        p.add(cbX11);
        p.add(new JLabel(LBL_LOCAL_DISP));
        p.add(Box.createRigidArea(new Dimension(4, 0)));
        p.add(textDisp);
        gridc.gridwidth = GridBagConstraints.REMAINDER;
        gridc.weightx = 1.0;
        mp.add(p, gridc);
        gridc.weightx = 0.0;

        lbl = new JLabel(LBL_SEND_KEEP, SwingConstants.RIGHT);
        gridc.gridwidth = 1;
        mp.add(lbl, gridc);
        p = new JPanel(new FlowLayout(FlowLayout.LEFT, 0, 0));
        cbAlive = new JCheckBox();
        cbAlive.addItemListener(ilf);
        textAlive = new JTextField("", 12);
        p.add(cbAlive);
        p.add(new JLabel(LBL_INTERVAL));
        p.add(Box.createRigidArea(new Dimension(4, 0)));
        p.add(textAlive);
        p.add(new JLabel(LBL_SECONDS));
        gridc.gridwidth = GridBagConstraints.REMAINDER;
        mp.add(p, gridc);

        gridc.gridwidth = 1;
        mp.add(new JPanel(), gridc);
        cbIdHost = new JCheckBox(LBL_STRICT);
        gridc.gridwidth = GridBagConstraints.REMAINDER;
        mp.add(cbIdHost, gridc);

        gridc.gridwidth = 1;
        mp.add(new JPanel(), gridc);
        cbKeyNoise = new JCheckBox(LBL_KEY_NOISE);
        gridc.gridwidth = GridBagConstraints.REMAINDER;
        mp.add(cbKeyNoise, gridc);

        gridc.gridwidth = 1;
        mp.add(new JPanel(), gridc);
        cbForcPty = new JCheckBox(LBL_ALLOC_PTY);
        gridc.gridwidth = GridBagConstraints.REMAINDER;
        mp.add(cbForcPty, gridc);

        gridc.weighty = 1.0;
        mp.add(Box.createVerticalGlue(), gridc);
        gridc.weighty = 0.0;

        tp.addTab(LBL_TAB_FEATURES, mp);

        /****************************************************************
         * Add stuff to dialog
         */
        dialog.getContentPane().add(tp, BorderLayout.CENTER);
        tp.setSelectedIndex(first);

        JButton ok = new JButton();
        if (client.isConnected()) {
            ok.setText(LBL_BTN_OK);
        } else {
            ok.setText(LBL_BTN_CONNECT);
        }
        JButton cancel = new JButton(LBL_BTN_CANCEL);
        JPanel bp = GUI.newButtonPanel(new JButton[] {ok,cancel});
        dialog.getContentPane().add(bp, BorderLayout.SOUTH);

        dialog.getRootPane().setDefaultButton(ok);

        dialog.setResizable(true);
        dialog.pack();

	GUI.placeDialog(dialog);
        dialog.addWindowListener(GUI.getWindowDisposer());        

        ph.clearAllForwards();
        populate();
	updateChoicesGeneral();
	updateChoicesProxy(null);
	updateChoicesSecurity(null);
	updateChoicesFeatures();

        if (comboSrv.getItemCount() > 0) {
            serverSelected();
        }
	if (comboSrv.isEnabled()) {
	    comboSrv.requestFocus();
        } else {
	    textUser.requestFocus();
        }

        cancel.addActionListener(new GUI.CloseAction(dialog));
        ok.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                try {
                    okPressed(dialog);
                } catch (Exception ee) {
                    alertDialog("Error: " + ee.getMessage());
                }
            }
        });      

	dialog.setVisible(true);
    }

    private void serverSelected() {
        Object item = comboSrv.getModel().getSelectedItem();
        if (item == null)
            return;

        String host = item.toString().trim();
        if (host.length() == 0)
            return;

        int port = Util.getPort(host, 22);
        host = Util.getHost(host);
        ph.setProperty("server", host);
        ph.setProperty("port", port);

        try {
            String pwd = "";
            do {
                try {
                    // If menu item was selected then select save alias
                    if (-1 != comboSrv.getSelectedIndex()) {
                        cbSaveAlias.setSelected(true);
                        textAlias.setText(host);
                    }

                    ph.setPropertyPassword(pwd);
                    ph.loadAliasFile(host, false);
                    populate();
                    break;
                } catch(SSHClient.AuthFailException ee) {
                }
            } while((pwd = passwordDialog(
                         "Please give file password for " +
                         host, "MindTerm - File Password")) != null);
        } catch (Throwable t) {
            //System.err.println("Got exception when loading props: " + t);
        }
    }

    private void okPressed(JDialog dialog) throws Exception {
        if (!client.isConnected()) {
            if (!extractDataFromGeneral()) {
                return;
            }
            extractDataFromProxy();
        }
        extractDataFromSecurity();
        extractDataFromFeatures();

        try {
            ph.saveCurrentFile();
        } catch (java.io.IOException e) {
            System.err.println("Failed to save settings: " + e);
        }
        // This causes the connect to commence
        client.sshStdIO.breakPromptLine();

        dialog.dispose();
    }

    private boolean extractDataFromGeneral() {
        String host = null;
        int port;

        host = comboSrv.getModel().getSelectedItem().toString().trim();
        if (host.length() == 0) {
            alertDialog("Please specify a server to connect to");
            return false;
        }
        port = Util.getPort(host, 22);
        host = Util.getHost(host);
        ph.setProperty("server", host);
        ph.setProperty("port", port);
        ph.setProperty("usrname", textUser.getText());

        if (cbSaveAlias.isSelected()) {
            String alias = textAlias.getText();
            if (alias == null || alias.trim().length() == 0) {
                alertDialog("Please specify an alias name for these settings");
                return false;
            }
            if (ph.savePasswords) {
                String pwd =
                    setPasswordDialog(
                        "Please set password for alias " + host,
                        "MindTerm - Set File Password");
                if (pwd == null)
                    return false;
                ph.setPropertyPassword(pwd);
            }
            ph.setAlias(alias);
        }

        client.quiet = true;

        String prxPasswd = ph.getProperty("prxpassword");
        ph.clearPasswords();
        if (prxPasswd != null)
            ph.setProperty("prxpassword", prxPasswd);

        String authType = (String)comboAuthTyp.getSelectedItem();
         if (authType.equals(LBL_CUSTOM_LIST)) {
             ph.setProperty("authtyp", customAuth);
         } else {
             ph.setProperty("authtyp", authType);
         }

        String pwd = null;
        char pwdc[] = textPwd.getPassword();
        if (pwdc != null && pwdc.length > 0) {
            pwd = new String(pwdc);
        }
        ph.setProperty("password", pwd);
        ph.setProperty("private-key", textPrivateKey.getText());
        ph.setProperty("private-host-key", textPrivateHostKey.getText());

        return true;
    }

    private void extractDataFromProxy() {
        String prxTypeStr = (String)comboPrxType.getSelectedItem();
        ph.setProperty("proxytype", prxTypeStr);
        if (!"none".equalsIgnoreCase(prxTypeStr)) {
            ph.setProperty("proxyhost", textPrxHost.getText());
            ph.setProperty("proxyport", textPrxPort.getText());
        }
        if (cbNeedAuth.isSelected()) {
            ph.setProperty("proxyuser", textPrxUser.getText());
            String pwd = null;
            char pwdc[] = textPrxPasswd.getPassword();
            if (pwdc != null && pwdc.length > 0) {
                pwd = new String(pwdc);
            }
            ph.setProperty("prxpassword", pwd);
        } else if ("socks4".equals(prxTypeStr)) {
            ph.setProperty("proxyuser", textPrxUser.getText());
        }
    }

    private void extractDataFromSecurity() throws Exception {
        String cipherC2S = (String)comboCipherC2S.getSelectedItem();
        String cipherS2C = (String)comboCipherS2C.getSelectedItem();
        boolean doReKey  = (client.isConnected() &&
                            client.isSSH2 &&
                            !client.transport.incompatibleCantReKey);
        if (doReKey) {
            checkSupportedByPeer();
        }

        if (cbProto1.isSelected() && cbProto2.isSelected()) {
            ph.setProperty("protocol", "auto");
        } else if (cbProto1.isSelected()) {
            ph.setProperty("protocol", "ssh1");
        } else if (cbProto2.isSelected()) {
            ph.setProperty("protocol", "ssh2");
        } else {
            throw new Exception(ERR_NO_PROTOCOL);
        }
        String keytypes = "";
        if (cbKeyTypeECDSA != null && cbKeyTypeECDSA.isSelected())
            keytypes += ",ecdsa-sha2-nistp256,ecdsa-sha2-nistp384,ecdsa-sha2-nistp521";
        if (cbKeyTypeRSA.isSelected())
            keytypes += ",ssh-rsa";
        if (cbKeyTypeDSA.isSelected())
            keytypes += ",ssh-dss";
        if (keytypes.equals(""))
            throw new Exception(ERR_NO_KEYTYPE);
        ph.setProperty("server-host-key-algorithms", keytypes.substring(1));        
        if (comboCipherC2S.getSelectedIndex() > 0) {
            ph.setProperty("enc-algorithms-cli2srv", cipherC2S);
            ph.setProperty("cipher", cipherC2S);
        } else {
            ph.resetProperty("enc-algorithms-cli2srv");
            ph.resetProperty("cipher");
        }
        if (comboCipherS2C.getSelectedIndex() > 0) {
            ph.setProperty("enc-algorithms-srv2cli", cipherS2C);
        } else {
            ph.resetProperty("enc-algorithms-srv2cli");
        }
        if (comboMacC2S.getSelectedIndex() > 0) {
            ph.setProperty("mac-algorithms-cli2srv", 
                           (String)comboMacC2S.getSelectedItem());
        } else {
            ph.resetProperty("mac-algorithms-cli2srv");
        }
        if (comboMacS2C.getSelectedIndex() > 0) {
            ph.setProperty("mac-algorithms-srv2cli", 
                           (String)comboMacS2C.getSelectedItem());
        } else {
            ph.resetProperty("mac-algorithms-srv2cli");
        }
                    
        int compLevel = comp2lvl[comboCompC2S.getSelectedIndex()];
        if (compLevel > 0) {
            ph.setProperty("comp-algorithms-cli2srv", "zlib,zlib@openssh.com");
        } else {
            ph.setProperty("comp-algorithms-cli2srv", "none");
        }
        ph.setProperty("compression", compLevel);
        compLevel = comboCompS2C.getSelectedIndex();
        if (compLevel > 0) {
            ph.setProperty("comp-algorithms-srv2cli", "zlib,zlib@openssh.com");
        } else {
            ph.setProperty("comp-algorithms-srv2cli", "none");
        }
                    
        if (doReKey) {
            SSH2Preferences prefs = new SSH2Preferences(ph.getProperties());
            client.transport.startKeyExchange(prefs);
        }
    }

    private void extractDataFromFeatures() {
        if (cbX11.isSelected()) {
            ph.setProperty("display", textDisp.getText());
        } else {
            ph.setProperty("display", "");
        }
        ph.setProperty("x11fwd", cbX11.isSelected());
        ph.setProperty("stricthostid", cbIdHost.isSelected());
        ph.setProperty("key-timing-noise", cbKeyNoise.isSelected());
        ph.setProperty("forcpty", cbForcPty.isSelected());
        if (cbAlive.isSelected()) {
            ph.setProperty("alive", textAlive.getText());
        } else {
            ph.setProperty("alive", "0");
        }
    }

    private JPanel getAuthLabel() {
	authLabelCP = new JPanel();
	authLabelCP.setLayout(authLabelCL = new CardLayout());

        int r = SwingConstants.RIGHT;
	authLabelCP.add(new JLabel(LBL_PASSWORD, r), "password");
	authLabelCP.add(new JPanel(), LBL_CUSTOM_LIST);
	authLabelCP.add(new JLabel(LBL_IDENTITY, r), "publickey");
	authLabelCP.add(new JPanel(), "securid");
	authLabelCP.add(new JPanel(), "tis");
	authLabelCP.add(new JPanel(), "kbd-interact");
	authLabelCP.add(new JLabel(LBL_HOST_KEY, r), "hostbased");

        return authLabelCP;
    }

    private Component makeCenter(Component c) {
        JPanel p = new JPanel(new GridBagLayout());
        GridBagConstraints gridc = new GridBagConstraints();        
        gridc.fill = GridBagConstraints.HORIZONTAL;
        gridc.weightx = 1.0;
        p.add(c, gridc);
        return p;
    }

    private JPanel getAuth() {
	authCP = new JPanel();
	authCP.setLayout(authCL = new CardLayout());

        textPwd = new JPasswordField("", 12);
	textPwd.setEchoChar('*');

        customBtn = new JButton(LBL_MODIFY_LIST);
        customBtn.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                customAuthDialog();
            }
        });      

        textPrivateKey = new JTextField("", 12);
        JButton browseBtn = new JButton(LBL_BTN_BROWSE);
        browseBtn.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                File file = GUI.selectFile(
                    parent,
                    "MindTerm - Select file with identity (private)",
                    ph.getSSHHomeDir(), false);
                if (file != null)
                    textPrivateKey.setText(file.getAbsolutePath());
            }
        });
        JPanel p = new JPanel(new GridBagLayout());
        GridBagConstraints gridc = new GridBagConstraints();        
        gridc.fill = GridBagConstraints.HORIZONTAL;
        gridc.weightx = 1.0;
        p.add(textPrivateKey, gridc);
        gridc.weightx = 0.0;
        p.add(browseBtn, gridc);

	authCP.add(makeCenter(textPwd), "password");
	authCP.add(makeCenter(customBtn), LBL_CUSTOM_LIST);
	authCP.add(p, "publickey");
	authCP.add(new JLabel(), "tis");
	authCP.add(new JLabel(), "kbd-interact");
 	authCP.add(new JPanel(), "securid");
 	authCP.add(new JPanel(), "tis");
 	authCP.add(new JPanel(), "kbd-interact");

        textPrivateHostKey = new JTextField("", 12);
        browseBtn = new JButton(LBL_BTN_BROWSE);
        browseBtn.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                File file = GUI.selectFile(
                    parent,
                    "MindTerm - Select file with private host key",
                    ph.getSSHHomeDir(), false);
                if (file != null)
                    textPrivateHostKey.setText(file.getAbsolutePath());
            }
        });
        p = new JPanel(new GridBagLayout());
        gridc = new GridBagConstraints();        
        gridc.fill = GridBagConstraints.HORIZONTAL;
        gridc.weightx = 1.0;
        p.add(textPrivateHostKey, gridc);
        gridc.weightx = 0.0;
        p.add(browseBtn, gridc);

        authCP.add(p, "hostbased");

        return authCP;
    }

    private void updateChoicesGeneral() {
        comboSrv.setEnabled(!client.isOpened());
        textUser.setEnabled(!client.isOpened());
        cbSaveAlias.setEnabled(!client.isOpened());
        textAlias.setEnabled(!client.isOpened());
        comboAuthTyp.setEnabled(!client.isOpened());
        textPwd.setEnabled(!client.isOpened());
        customBtn.setEnabled(!client.isOpened());
        textPrivateKey.setEnabled(!client.isOpened());
        textPrivateHostKey.setEnabled(!client.isOpened());

	String auth = (String)comboAuthTyp.getSelectedItem();
	authLabelCL.show(authLabelCP, auth);
	authCL.show(authCP, auth);
	if (cbSaveAlias.isSelected()) {
            textAlias.setEnabled(true);
	    String t = textAlias.getText();
	    if (!textAlias.isEnabled() &&
                (t == null || t.trim().length() == 0)) {
		textAlias.setText(
                    comboSrv.getModel().getSelectedItem().toString().trim());
		textAlias.requestFocus();
	    }
	} else {
	    textAlias.setText("");
	    textAlias.setEnabled(false);
	}
    }

    private void updateChoicesProxy(ItemEvent e) {
        if (e == null || e.getSource() == comboPrxType) {
            int pt = SSH.getProxyType((String)comboPrxType.getSelectedItem());
            textPrxPort.setText(String.valueOf(SSH.defaultProxyPorts[pt]));
        }

        boolean proxyEnable = true;
        boolean authEnable  = true;
        String  proxyType   = (String)comboPrxType.getSelectedItem();
        int     type        = SSH.PROXY_NONE;

        try {
            type = SSH.getProxyType(proxyType);
        } catch (Exception ee) {} // Ignored
        if (type == SSH.PROXY_NONE) {
            proxyEnable = false;
        }
        if (type == SSH.PROXY_NONE || type == SSH.PROXY_SOCKS4) {
            authEnable = false;
        }
        if (client.isConnected()) {
            proxyEnable = false;
            comboPrxType.setEnabled(false);
        } else {
            comboPrxType.setEnabled(true);
        }
        textPrxHost.setEnabled(proxyEnable);
        textPrxPort.setEnabled(proxyEnable);
        cbNeedAuth.setEnabled(authEnable);

        if (!authEnable)
            cbNeedAuth.setSelected(false);

        textPrxUser.setEnabled(cbNeedAuth.isSelected());
        textPrxPasswd.setEnabled(cbNeedAuth.isSelected());
    }

    private void updateChoicesSecurity(ItemEvent e) {
	boolean isOpen = client.isOpened();

        boolean isSSH2;
        if (isOpen) {
            isSSH2 = client.isSSH2;
        } else {
            isSSH2 = cbProto2.isSelected();
        }

        if (!isFipsMode()) {
            cbProto1.setEnabled(!isOpen);
            cbProto2.setEnabled(!isOpen);
            if (cbKeyTypeECDSA != null)
                cbKeyTypeECDSA.setEnabled(!isOpen);
            cbKeyTypeDSA.setEnabled(!isOpen);
            cbKeyTypeRSA.setEnabled(!isOpen);
        }
        
	boolean incompat = false;
	if (client.transport != null) {
	    incompat = client.transport.incompatibleCantReKey;
	}
	boolean tpset  = !isOpen || (isSSH2 && isOpen && !incompat);
	comboCipherS2C.setEnabled(tpset && isSSH2);
	comboMacS2C.setEnabled(tpset && isSSH2);
	comboCompS2C.setEnabled(tpset && isSSH2);
	comboCipherC2S.setEnabled(tpset);
	comboMacC2S.setEnabled(tpset && isSSH2);
	comboCompC2S.setEnabled(tpset);

        if (e != null && e.getSource() == comboCipherC2S) {
            comboCipherS2C.setSelectedItem(e.getItem());
        } else if (e != null && e.getSource() == comboMacS2C) {
            comboMacS2C.setSelectedItem(e.getItem());
        } else if (e != null && e.getSource() == comboCompS2C) {
            if ("none".equals(e.getItem())) {
                comboCompS2C.setSelectedItem("none");
            } else {
                comboCompS2C.setSelectedItem("medium");
            }
        }
    }

    private void updateChoicesFeatures() {
	boolean isOpen = client.isOpened();
	cbX11.setEnabled(!isOpen);
	cbIdHost.setEnabled(!isOpen);
	cbForcPty.setEnabled(!isOpen);

        textAlive.setEnabled(cbAlive.isSelected());
        textDisp.setEnabled(cbX11.isSelected());
    }

    // Populate the new server dialog
    private void populate() {
        ignoreEvents = true;

        // General
        String port = ph.getProperty("port");
        String server;
        if (port.length() > 0 && !port.equals("22")) {
            server = ph.getProperty("server") + ":" + port;
        } else {
            server = ph.getProperty("server");
        }
        if (server != null)
            comboSrv.getModel().setSelectedItem(server);
        textUser.setText(ph.getProperty("username"));
        textPrivateKey.setText(ph.getProperty("private-key"));
        textPrivateHostKey.setText(ph.getProperty("private-host-key"));
        customAuth = ph.getProperty("auth-method");
        if (-1 == customAuth.indexOf(',')) {
            comboAuthTyp.setSelectedItem(customAuth);
        } else {
            comboAuthTyp.setSelectedItem(LBL_CUSTOM_LIST);
        }

        // Proxy
        comboPrxType.getModel().setSelectedItem(ph.getProperty("proxytype"));
        textPrxHost.setText(ph.getProperty("proxyhost"));
        textPrxPort.setText(ph.getProperty("proxyport"));
        textPrxUser.setText(ph.getProperty("proxyuser"));
    
        // Security
        if (isFipsMode()) {
            cbKeyTypeDSA.setEnabled(false);
            cbKeyTypeRSA.setEnabled(false);
            cbKeyTypeDSA.setSelected(false);
            cbKeyTypeRSA.setSelected(true);
            if (cbKeyTypeECDSA != null) {
                cbKeyTypeECDSA.setEnabled(false);
                cbKeyTypeECDSA.setSelected(false);
            }
            cbProto1.setSelected(false);
            cbProto2.setSelected(true);
            cbProto1.setEnabled(false);
            cbProto2.setEnabled(false);
        } else {
            String hkeyalgs = ph.getProperty("server-host-key-algorithms");
            cbKeyTypeRSA.setSelected(-1 != hkeyalgs.indexOf("ssh-rsa"));
            cbKeyTypeDSA.setSelected(-1 != hkeyalgs.indexOf("ssh-dss"));
            if (cbKeyTypeECDSA != null)
                cbKeyTypeECDSA.setSelected(-1 != hkeyalgs.indexOf("ecdsa-sha2-nistp"));
            cbProto1.setSelected(!ph.getProperty("protocol").equals("ssh2"));
            cbProto2.setSelected(!ph.getProperty("protocol").equals("ssh1"));
        }
	comboCipherC2S.setSelectedIndex(0);
	comboCipherS2C.setSelectedIndex(0);
	comboMacC2S.setSelectedIndex(0);
	comboMacS2C.setSelectedIndex(0);

	comboCipherC2S.setSelectedItem(ph.getProperty("enc-algorithms-cli2srv"));
	comboCipherS2C.setSelectedItem(
            ph.getProperty("enc-algorithms-srv2cli"));
	comboMacC2S.setSelectedItem(ph.getProperty("mac-algorithms-cli2srv"));
	comboMacS2C.setSelectedItem(ph.getProperty("mac-algorithms-srv2cli"));

	int compLevel = ph.getCompressionLevel();
	comboCompC2S.setSelectedItem(lvl2comp[compLevel]);
	String s2cComp = ph.getProperty("comp-algorithms-srv2cli");
	if ("none".equals(s2cComp)) {
	    comboCompS2C.setSelectedItem("none");
	} else {
	    comboCompS2C.setSelectedItem("medium");
	}

        // Features
	textDisp.setText(ph.getProperty("display"));
	textAlive.setText(ph.getProperty("alive"));

	cbX11.setSelected(ph.getPropertyB("x11fwd"));
	cbAlive.setSelected(!ph.getProperty("alive").equals("0"));

	cbIdHost.setSelected(ph.getPropertyB("stricthostid"));
	cbKeyNoise.setSelected(ph.getPropertyB("key-timing-noise"));
	cbForcPty.setSelected(ph.getPropertyB("forcpty"));
        ignoreEvents = false;
    }

    private void checkSupportedByPeer() throws Exception {
	checkSupportedByPeer(SSH2Preferences.CIPHERS_C2S, comboCipherC2S);
	checkSupportedByPeer(SSH2Preferences.CIPHERS_S2C, comboCipherS2C);
	checkSupportedByPeer(SSH2Preferences.MACS_C2S, comboMacC2S);
	checkSupportedByPeer(SSH2Preferences.MACS_S2C, comboMacS2C);
	if ((!((String)comboCompC2S.getSelectedItem()).equals("none") &&
	    !client.transport.getPeerPreferences().
	    isSupported(SSH2Preferences.COMP_C2S, "zlib"))
	   ||
	   (!((String)comboCompS2C.getSelectedItem()).equals("none") &&
	    !client.transport.getPeerPreferences().
	    isSupported(SSH2Preferences.COMP_S2C, "zlib"))) {
	    throw new Exception("Peer doesn't support 'zlib'");
	}
    }

    private void checkSupportedByPeer(String type, JComboBox c)
        throws Exception {
	if (c.getSelectedIndex() == 0) {
	    return;
	}
	String item = (String)c.getSelectedItem();
	if (!client.transport.getPeerPreferences().isSupported(type, item)) {
	    throw new Exception("Peer doesn't support: " + item);
	}
    }

    private void customAuthDialog() {
        final JDialog dialog = GUI.newBorderJDialog(parent, LBL_CUSTOM_LIST, true);

        JPanel p = new JPanel(new GridBagLayout());
        GridBagConstraints gridc = new GridBagConstraints();
        gridc.anchor    = GridBagConstraints.WEST;
        gridc.gridwidth = GridBagConstraints.REMAINDER;
        gridc.insets    = new Insets(2,2,2,2);

        authMethod = new JCheckBox[AUTH_METHODS.length];
        // The -1 is to exclude the custom auth-method
        for (int i=0; i< authMethod.length-1; i++) {
            authMethod[i] = new JCheckBox(AUTH_METHODS[i]);
            authMethod[i].setSelected(
                -1 != customAuth.indexOf(AUTH_METHODS[i]));
            p.add(authMethod[i], gridc);
        }
        
        dialog.getContentPane().add(p, BorderLayout.CENTER);

        JButton ok = new JButton(LBL_BTN_OK);
        JButton cancel = new JButton(LBL_BTN_CANCEL);
        JPanel bp = GUI.newButtonPanel(new JButton[] {ok,cancel});
        dialog.getContentPane().add(bp, BorderLayout.SOUTH);

        dialog.getRootPane().setDefaultButton(ok);

        dialog.setResizable(true);
        dialog.pack();

	GUI.placeDialog(dialog);
        dialog.addWindowListener(GUI.getWindowDisposer());        

        cancel.addActionListener(new GUI.CloseAction(dialog));
        ok.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                StringBuffer auths = new StringBuffer();
                for (int i=0; i< authMethod.length-1; i++) {
                    if (authMethod[i].isSelected()) {
                        if (auths.length() > 0) {
                            auths.append(',');
                        }
                        auths.append(AUTH_METHODS[i]);
                    }
                }
                customAuth = auths.toString();
                dialog.dispose();
            }
        });      

	dialog.setVisible(true);
    }

    public final void loadFileDialog() {

        File file = GUI.selectFile(parent, "MindTerm - Select file to load settings from", 
                                   client.propsHandler.getSSHHomeDir(), false);
        
        if (file == null) return;
        
        try {
            String pwd = "";
            do {
                try {
                    client.propsHandler.setPropertyPassword(pwd);
                    client.propsHandler.loadAbsoluteFile(file.getAbsolutePath(), false);
                    client.quiet = true;
                    client.sshStdIO.breakPromptLine("Loaded new settings: " + file.getName());
                    break;
                } catch(SSHClient.AuthFailException ee) {
                }
            } while((pwd = passwordDialog("Please give password for " +
                                          file.getName(), "MindTerm - File Password")) != null);
        } catch (Throwable t) {
            alertDialog("Error loading settings: " + t.getMessage());
        }
    }

    public void keyGenerationDialogCreate(String title) {
        SSHKeyGenerationDialog.show(title, parent, client);
    }
    private final void keyGenerationDialogCreate() {
        keyGenerationDialogCreate("MindTerm - Publickey Keypair Generation");
    }
    
    public void keyGenerationDialogEdit(String title) {
        SSHKeyGenerationDialog.editKeyDialog(title, parent, client);
    }
    private final void keyGenerationDialogEdit() {
        keyGenerationDialogEdit("MindTerm - Publickey Keypair Edit");
    }

    public final void saveAsFileDialog() {
	String fname = client.propsHandler.currentAlias;
	if(fname == null)
	    fname = client.propsHandler.getProperty("server");
        fname += SSHPropertyHandler.PROPS_FILE_EXT;

        File file = GUI.selectFile(parent, "MindTerm - Select file to save settings to", 
                                   client.propsHandler.getSSHHomeDir(), fname, true);        

        if (file == null) return;
        
        try {
            if (client.propsHandler.savePasswords) {
                String pwd = setPasswordDialog("Please set password for " + file.getName(),
                                               "MindTerm - Set File Password");
                if (pwd == null)
                    return;
                client.propsHandler.setPropertyPassword(pwd);
            }
            client.propsHandler.saveAsCurrentFile(file.getAbsolutePath());
        } catch (Throwable t) {
            alertDialog("Error saving settings: " + t.getMessage());
        }
    }

    public final void alertDialog(String message) {
	GUI.showAlert("MindTerm - Alert", message, parent);
    }

    public final String passwordDialog(String message, String title) {
	return SSHMiscDialogs.password(title, message, parent);
    }

    public final String setPasswordDialog(String message, String title) {
	return SSHMiscDialogs.setPassword(title, message, parent);
    }

    public final boolean confirmDialog(String message, boolean defAnswer) {
        return GUI.showConfirm("MindTerm - Confirmation", message,
                               defAnswer, parent);
    }

    public final void textDialog(String title, String text, int rows, int cols, boolean scrollbar) {
        GUI.showNotice(parent, title, text, rows, cols, scrollbar);
    }

    private void aboutDialog(Component parent, SSHInteractiveClient client, 
                               String title, String aboutText) {
	final JDialog dialog = GUI.newBorderJDialog(parent, title, true);
        
 	Component logo = client.getLogo();
 	if (logo != null) {
            JPanel p = new JPanel();
            p.add(logo);
 	    dialog.getContentPane().add(p, BorderLayout.NORTH);
        }

	JTextArea textArea = new JTextArea(aboutText, 12, 40);
	textArea.setEditable(false);
        JScrollPane sp = new JScrollPane
            (textArea, ScrollPaneConstants.VERTICAL_SCROLLBAR_AS_NEEDED, 
             ScrollPaneConstants.HORIZONTAL_SCROLLBAR_NEVER);

        dialog.getContentPane().add(sp, BorderLayout.CENTER);

	JButton okTextBut = new JButton(LBL_BTN_OK);
	okTextBut.addActionListener(new GUI.CloseAction(dialog));
        
        JPanel p = new JPanel(new FlowLayout(FlowLayout.RIGHT));
        p.add(okTextBut);
        dialog.getContentPane().add(p, BorderLayout.SOUTH);

	dialog.setResizable(true);
	dialog.pack();

	GUI.placeDialog(dialog);
	okTextBut.requestFocus();
        dialog.addWindowListener(GUI.getWindowDisposer());
	dialog.setVisible(true);
    }

    private String[] getAvailableAliases() {
        String[] al = ph.availableAliases();
        if (al != null) {
            firstAlias = al[0];
            Arrays.sort(al);
        } else {
            al = new String[0];
        }
        return al;
    }

    private String getFirstAlias() {
        return firstAlias;
    }
}
