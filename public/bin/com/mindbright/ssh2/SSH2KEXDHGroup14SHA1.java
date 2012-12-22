/******************************************************************************
 *
 * Copyright (c) 2005-2011 Cryptzone Group AB. All Rights Reserved.
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

package com.mindbright.ssh2;

import java.math.BigInteger;

/**
 * Implements diffie hellman key exchange using a predefined group. This
 * algorithm is known as 'diffie-hellman-group14-sha1'
 */
public class SSH2KEXDHGroup14SHA1 extends SSH2KEXDHGroupNumSHA1 {
    public final static BigInteger groupP =
        com.mindbright.jce.provider.publickey.ModPGroups.oakleyGroup14P;

    public final static BigInteger groupG = 
        com.mindbright.jce.provider.publickey.ModPGroups.oakleyGroup14G;

    public final static String name = "SSH2KEXDHGroup14SHA1";

    public BigInteger getGroupP() {return groupP;}
    public BigInteger getGroupG() {return groupG;}
    public String getName()       {return name;  }
}
