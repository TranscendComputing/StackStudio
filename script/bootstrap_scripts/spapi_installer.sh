#!/bin/bash

###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ###### 
#--- Logger stuff has to exist before called, so make it early
LOGFILE="${HOME}/sc_install.log"

logmsg()
{
	echo "$(date): $1" 2>&1 | tee -a ${LOGFILE}
}

###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ###### 
#--- Globals

GEM="/usr/local/bin/gem"
SERVERNAME="${2}"
SC_TAR="s3://${1}/stackcore.tar.gz"
HOME="/home/spapi"
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
create_sc_apache_config()
{
	logmsg "Creating apache conf file for stack-core ..."
	conf="/tmp/stack-core.conf"
	cat > "${conf}" <<-EOF
		<VirtualHost *:80>
		  ServerAdmin spapi@localhost
		  ServerName api.stackplace.com
		  DocumentRoot /home/spapi/stack-core/public
		  <Directory /home/spapi/stack-core/public>
		    Options Indexes FollowSymLinks -MultiViews
		    AllowOverride all
		    Order allow,deny
		    allow from all
		  </Directory>
		  RackEnv production
		  RailsEnv production
		  PassengerMinInstances 5
		  PassengerPreStart https://api.stackplace.com
		  ErrorLog /var/log/httpd/stack-core-error_log
		  LogLevel warn
		  CustomLog /var/log/httpd/stack-core-access_log combined
		  RewriteEngine On
		  RewriteCond %{HTTP:X-Forwarded-Proto} !https
		  RewriteRule !/hc.html https://%{SERVER_NAME}%{REQUEST_URI} [L,R]
		</VirtualHost>
	EOF
	chmod 644 "${conf}"
}


install_stackcore()
{
	#--- cd into <UI dir>/StackStudio/
	cd ${HOME}

	#--- get the code
	logmsg "Grabbing stack-core source ..."
	s3cmd --config=/etc/s3cfg get "${SC_TAR}" ${HOME} --force
	tar xzf "${HOME}/stackcore.tar.gz"

	#--- run "bundle install" (this will install required gems, including right_aws)
	cd ${HOME}/stack-core
	#. ${HOME}/.rvmrc
	#rvm use ${RUBY_VERSION}@spapi
	rvm use 1.9.2
	gem install bundler --no-ri --no-rdoc
	bundle install --without development test
	create_sc_apache_config
}

change_dir_permissions()
{
	#--- Change permissions to allow apache access to UI files
	logmsg "Setting directory permissions ..."
	chmod 755 ${HOME}/stack-core
	find ${HOME}/stack-core -type d -exec chmod 755 {} \;
	find ${HOME}/stack-core -type f -exec chmod 644 {} \;
}

setup_stackcore_rvm()
{
        rvm user gemsets
	. ${HOME}/.rvmrc
	#rvm gemset create spapi
	rvm use ${RUBY_VERSION}@spapi --create --default
}

run_spapi_postinstall()
{
	logmsg "Running post installers."
	cd ${HOME}/stack-core >/tmp/mongoseed.log 2>&1
	#. ${HOME}/.rvmrc
	#rvm use ${RUBY_VERSION}@spapi
	rvm use 1.9.2
	bundle exec rake db:seed >/tmp/mongoseed.log 2>&1
	logmsg "Finished seeding mongo."
}	


###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ###### 
#--- Source bashrc
. ${HOME}/.bashrc

###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ###### 
#--- Configure general OS level files.
export PATH="${PATH}:/usr/local/bin"

logmsg "Installing rvm for spapi user"
#setup_stackcore_rvm
logmsg "Starting stackcore install ..."
install_stackcore ${1}
change_dir_permissions
run_spapi_postinstall
logmsg "... finished stackcore install."
