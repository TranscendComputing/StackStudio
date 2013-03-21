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

_DEBUG = True

class WarmupHandler(webapp2.RequestHandler):
    """
    Simple request handler for accepting warmup requests.
    """

    def get(self):
        self.response.write('\nAll warmed up.')

app = webapp2.WSGIApplication([
    ('/_ah/warmup', WarmupHandler),
], debug=_DEBUG)
