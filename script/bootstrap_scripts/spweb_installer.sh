#!/bin/bash

###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ###### 
#--- Logger stuff has to exist before called, so make it early
LOGFILE="${HOME}/sw_install.log"

logmsg()
{
	echo "$(date): $1" 2>&1 | tee -a ${LOGFILE}
}

###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ###### 
#--- Globals

GEM="/usr/local/bin/gem"
SERVERNAME="${2}"
SW_TAR="s3://${1}/stackweb.tar.gz"
HOME="/home/spweb"
RUBY_VERSION="1.9.2"

###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ###### 
#--- Sanity Checks

if [ "${SERVERNAME}" == "" ]; then
	logmsg "ERROR: insufficient arbuments to $0."
	logmsg "usage: $0 initDB|NoInitDB url_for_scripts."
	exit 1
fi

###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ###### 
#--- functions for use to keep the main line clean

create_sw_apache_config()
{
	logmsg "Creating apache conf file for stack-core ..."
	conf="/tmp/stack-web.conf"
	cat > "${conf}" <<-EOF
		<VirtualHost *:80>
		  ServerAdmin spweb@localhost
		  ServerName www.stackplace.com
		  DocumentRoot /home/spweb/stack-web/public
		  <Directory /home/spweb/stack-web/public>
		    Options Indexes FollowSymLinks -MultiViews
		    AllowOverride all
		    Order allow,deny
		    allow from all
		  </Directory>
		  RackEnv production
		  RailsEnv production
		  PassengerMinInstances 5
		  PassengerPreStart https://www.stackplace.com
		  ErrorLog /var/log/httpd/stack-web-error_log
		  LogLevel warn
		  CustomLog /var/log/httpd/stack-web-access_log combined
		  RewriteEngine On
		  RewriteCond %{HTTP:X-Forwarded-Proto} !https
		  RewriteRule !/hc.html https://%{SERVER_NAME}%{REQUEST_URI} [L,R]
		</VirtualHost>
	EOF
	chmod 644 "${conf}"
}


install_stackweb()
{
	#--- cd into <UI dir>/StackStudio/
	cd ${HOME}

	#--- get the code
	logmsg "Grabbing stack-web source ..."
	s3cmd --config=/etc/s3cfg get "${SW_TAR}" ${HOME} --force
	tar xzf "${HOME}/stackweb.tar.gz"

	#--- run "bundle install" (this will install required gems, including right_aws)
	cd ${HOME}/stack-web
	#. ${HOME}/.rvmrc
	#rvm use ${RUBY_VERSION}@spweb
	rvm use 1.9.2
	gem install bundler --no-ri --no-rdoc
	bundle install --without development test
	create_sw_apache_config
}

change_dir_permissions()
{
	#--- Change permissions to allow apache access to UI files
	logmsg "Setting directory permissions ..."
	chmod 755 ${HOME}/stack-web
	find ${HOME}/stack-web -type d -exec chmod 755 {} \;
	find ${HOME}/stack-web -type f -exec chmod 644 {} \;
}

setup_stackweb_rvm()
{
        rvm user gemsets
	. ${HOME}/.rvmrc
	#rvm gemset create spapi
	rvm use ${RUBY_VERSION}@spweb --create --default
}

###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ###### 
#--- Source bashrc
. ${HOME}/.bashrc

###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ###### 
#--- Configure general OS level files.
export PATH="${PATH}:/usr/local/bin"

logmsg "Installing rvm for spweb user"
#setup_stackweb_rvm
logmsg "Starting stackweb install ..."
install_stackweb ${1}
change_dir_permissions
logmsg "... finished stackweb install."
