/******************************************************************************
 *
 * Copyright (c) 2006-2011 Cryptzone Group AB. All Rights Reserved.
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

import java.util.Vector;

/**
 * Queue to use together with nio handling. This is a first-in
 * first-out queue where handling can be stopped. The handling of
 * objects is started automatically when the queue is created.
 *
 * @see NQueueCallback
 */
public class NQueue {
    private Vector<Object> _queue;
    private NQueueCallback _callback;
    private boolean _stopped;

    /**
     * Create a new queue which is going to use the provided
     * switchboard and call the provided callback with new objects.
     *
     * @param callback interface to call once new object arrive
     */
    public NQueue(NQueueCallback callback) {
        _queue = new Vector<Object>();
        _callback = callback;
        _stopped = false;
    }

    /**
     * Append an object to the tail of this queue
     *
     * @param obj object to append
     */
    public synchronized void append(Object obj) {
        if (_stopped) {
            _queue.addElement(obj);
        } else {
            _callback.handleQueue(obj);
        }
    }

    /**
     * Stop the processing of objects on this queue. This just means
     * that new objects are "queued" up instead of beeing processed.
     */
    public synchronized void stop() {
        _stopped = true;
    }

    /**
     * Resume handling of objects. This will release all objects on
     * the queue at the moment.
     */
    public synchronized void restart() {
        _stopped = false;
        while (_queue.size() > 0) {
            _callback.handleQueue(_queue.firstElement());
	    _queue.removeElementAt(0);
        }
    }

    public synchronized String toString() {
        return "NQueue[stopped=" + _stopped + ",queued=" + _queue.size() + ",callback=" + _callback + "]";
    }
}
