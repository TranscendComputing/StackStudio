/******************************************************************************
 *
 * Copyright (c) 2006-2011 Cryptzone AB. All Rights Reserved.
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

package com.mindbright.nio;

import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.ByteBuffer;

import java.nio.channels.Pipe;
import java.nio.channels.WritableByteChannel;

import java.nio.channels.spi.AbstractInterruptibleChannel;
import java.nio.channels.spi.AbstractSelectableChannel;

/**
 * A non-blocking output stream.
 */
public class NonBlockingOutput {
    private volatile boolean _writeWaiting;
    private AbstractInterruptibleChannel _channel;
    private Switchboard _switchboard;

    protected NonBlockingOutput(Switchboard switchboard,
                                AbstractInterruptibleChannel channel) 
        throws IOException {
        _switchboard = switchboard;
        _channel = channel;
        _writeWaiting = false;
        if (_channel instanceof AbstractSelectableChannel) {
            AbstractSelectableChannel a = (AbstractSelectableChannel)_channel;
            a.configureBlocking(false);
        }
    }

    /**
     * Creates a new NonBlockingOutput object which sends any output
     * to a pipe.
     *
     * @param pipe Pipe to send output to
     */
    public NonBlockingOutput(Pipe pipe) throws IOException {
        this(Switchboard.getSwitchboard(), pipe.sink());
    }

    /**
     * Creates a new NonBlockingOutput object which sends any output
     * to a file. Note that any write calls to this file will be blocking.
     *
     * @param name Name of file to store data in
     */
    public NonBlockingOutput(String name) throws IOException {
        this(Switchboard.getSwitchboard(),
             new FileOutputStream(name).getChannel());
    }

    /**
     * Writes the specified byte
     */
    public void write(int data) throws IOException {
        byte array[] = new byte[1];
        array[0] = (byte)data;
        write(array);
    }

    /**
     * Writes all the bytes in the provided buffer to the stream
     */
    public void write(byte data[]) throws IOException {
        write(ByteBuffer.wrap(data));
    }

    /**
     * Writes the indicated part of the buffer to the stream
     */
    public void write(byte data[], int offset, int length)
        throws IOException {
        write(ByteBuffer.wrap(data, offset, length));
    }

    private void write(ByteBuffer buf) throws IOException {
        _switchboard.debug2("NBO", "write",
                            "w=" + _writeWaiting + ", r=" + buf.remaining());
        if (!_writeWaiting) {
            _switchboard.debug2("NBO", "write", "writing buf to pipe");
            ((WritableByteChannel)_channel).write(buf);
            _switchboard.debug2("NBO", "write", "r=" + buf.remaining());
        } 
        if (buf.remaining() > 0
            && _channel instanceof AbstractSelectableChannel) {
            _switchboard.debug2("NBO", "write",
                                "storing remaining in switchboard");
            _writeWaiting = true;
            _switchboard.write((AbstractSelectableChannel)_channel, buf, this);
        }
    }

    protected void clearWriteWaiting() {
        _writeWaiting = false;
    }

    /**
     * Tries to flush any bytes to the underlying stream
     */
    public void flush() {}

    /**
     * Close the underlying stream. It will not be possible to perform
     * any further writes.
     */
    public void close() throws IOException {
        _channel.close();
    }
}
