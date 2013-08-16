StackStudio
===========

This is the StackStudio application; a web based console for managing
private and public clouds.

Getting Started
---------------

1. This application requires the CloudMux back end, which provides REST APIs to perform cloud operations.  CloudMux is available here: https://github.com/TranscendComputing/CloudMux

2. We use Node.JS and Grunt for build and release steps.  You'll need to install Node and NPM, from:

    http://nodejs.org/#download

3. Install Grunt and dependencies, cd to the <tt>StackStudio</tt> directory and run NPM:

    `cd StackStudio`
    `npm install`

4. To launch a web server, you can run a task:

    `grunt run`

    (9001 is the default listening port)

6. Allow StackStudio to reach CloudMux as its backend. When CloudMux is running locally, StackStudio will find it at localhost:9292. If CloudMux is running in a remote location, then you must edit your hosts file to specify its location. Add the following lines to your hosts file, while editing <remote host ip>.

	127.0.0.1 		 stackstudio-local
	<remote host ip> stackstudio-api

5. If CloudMux is running locally go to http://localhost:9001/ for the StackStudio Dashboard. If CloudMux is running in a remote location go to http://stackstudio-local:9001/ for the StackStudio Dashboard.

Compatibility
-------------

StackStudio targets the following browser platforms:

✔ IE 6+
✔ Firefox 2+
✔ Safari 3.2+
✔ Chrome 3+
✔ Opera 10+


