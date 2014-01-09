StackStudio
===========
[![Build Status](https://secure.travis-ci.org/TranscendComputing/StackStudio.png?branch=master)][travis]
[![Code Climate](https://codeclimate.com/github/TranscendComputing/StackStudio.png)][codeclimate]
<!---[![Dependency Status](https://gemnasium.com/TranscendComputing/harp-runtime.png?travis)][gemnasium] -->

<!--- [gem]: https://rubygems.org/gems/harp-runtime -->
[travis]: http://travis-ci.org/TranscendComputing/StackStudio
[codeclimate]: https://codeclimate.com/github/TranscendComputing/StackStudio

This is the StackStudio application; a web based console for managing
private and public clouds.

Getting Started
---------------

1. This application requires the CloudMux back end, which provides REST APIs to perform cloud operations.  CloudMux is available here: https://github.com/TranscendComputing/CloudMux

2. We use Node.JS and Grunt for build and release steps.  You'll need to install Node and NPM, from:

    http://nodejs.org/#download

3. Install Grunt and dependencies, cd to the <tt>StackStudio</tt> directory and run NPM:

    ```
    cd StackStudio
    npm install
    # If you've never installed Grunt, you'll need the command line
    sudo npm install -g grunt-cli
    ```

4. To launch a web server, you can run a task:

    ```
    grunt run
    ```

    (9001 is the default listening port)

6. Allow StackStudio to reach CloudMux as its backend.

	Copy backend.json.sample to backend.json

    ```
	cp backend.json.sample backend.json
    ```

	Edit backend.json @backend_endpoint@ field to point to your CloudMux backend.

	(e.g. "http://localhost:9292")

5. Go to http://localhost:9001/ and you'll see the StackStudio Dashboard.

Compatibility
-------------

StackStudio targets the following browser platforms:

✔ IE 6+  
✔ Firefox 2+  
✔ Safari 3.2+  
✔ Chrome 3+  
✔ Opera 10+  


