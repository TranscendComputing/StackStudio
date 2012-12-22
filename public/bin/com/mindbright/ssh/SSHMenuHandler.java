/******************************************************************************
 *
 * Copyright (c) 1999-2011 Cryptzone Group AB. All Rights Reserved.
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

import java.awt.Component;
// import java.awt.MenuBar;
// import java.awt.PopupMenu;
import javax.swing.JMenuBar;

import com.mindbright.application.MindTerm;
import com.mindbright.terminal.TerminalMenuListener;
import com.mindbright.terminal.TerminalMenuHandler;
import com.mindbright.terminal.TerminalWin;

public abstract class SSHMenuHandler implements TerminalMenuListener {
    boolean havePopupMenu = false;

    public abstract void init(MindTerm mindterm, SSHInteractiveClient client,
                              Component parent, TerminalWin term);
    public abstract void update();    
    public void close(TerminalMenuHandler originMenu) {}
    public abstract void prepareMenuBar(JMenuBar mb);
    public abstract void preparePopupMenu();
    
    public abstract void setPopupButton(int popButtonNum);
    public abstract int getPopupButton();

    public abstract boolean confirmDialog(String message, boolean defAnswer);
    public abstract void alertDialog(String message);
    public abstract void textDialog(String head, String text,
                                    int rows, int cols, boolean scrollbar);
}
