#!/usr/bin/env python
#
# (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
import webapp2
import logging
import os
from datetime import datetime

import urllib2
from urllib2 import HTTPError

_DEBUG = True

MAX_USERWAITING_REQUEST_TIMEOUT = 30

class NonRedirectHTTPRedirectHandler(urllib2.HTTPRedirectHandler):
    """
    The proxy should end when we get a 302 response, so we need a custom
    handler that doesn't follow the redirect.
    """
    def http_error_302(self, req, fp, code, msg, headers):
        logging.info("Got a redirect %s to: " % msg)
        if 'location' in headers:
            logging.info("Got a location header: %s" % (headers['location']))
            raise StopIteration(headers['location'])
        return urllib2.HTTPRedirectHandler.http_error_302(self, req, fp, code, msg, headers)

    http_error_301 = http_error_303 = http_error_307 = http_error_302

class ProxyHandler(webapp2.RequestHandler):
    """
    Proxy request handler, for turning cross domain requests into same domain.
    """

    def get(self):
        try:
            target_url = self.request.GET['url']
        except:
            self.response.set_status(404)
            return
        logging.info("Fetching %s" % target_url)
        headers = {}
        req = urllib2.Request(target_url, headers=headers)
        opener = urllib2.build_opener(NonRedirectHTTPRedirectHandler)

        try:
            proxied_response = opener.open(req)
        except StopIteration, e:
            self.redirect(e.message, permanent=False)
            return
        except ValueError, e:
            self.response.set_status(400)
            return
        except urllib2.HTTPError, http_error:
            self.response.set_status(http_error.code)
            return
        chunk = True
        while chunk:
            chunk = proxied_response.read(1024)
            self.response.out.write(chunk)

    def post(self):
        target_url = self.request.POST['url']
        logging.info("Got body: %s" % (self.request.body))
        logging.info("Fetching %s" % self.PROXIED_URL)
        headers = {}
        req = urllib2.Request(target_url, headers=headers)
        opener = urllib2.build_opener(NonRedirectHTTPRedirectHandler)
        try:
            proxied_response = opener.open(req, self.request.body)
        except StopIteration, e:
            self.redirect(e.message, permanent=False)
            return
        chunk = True
        while chunk:
            chunk = proxied_response.read(1024)
            self.response.out.write(chunk)

app = webapp2.WSGIApplication([
    ('/getit', ProxyHandler),
], debug=_DEBUG)
