#!/bin/bash

###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ###### 
#--- Logger stuff has to exist before called, so make it early
LOGFILE="${HOME}/ss_install.log"

logmsg()
{
	echo "$(date): $1" 2>&1 | tee -a ${LOGFILE}
}

###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ###### 
#--- Globals

GEM="/usr/local/bin/gem"
SERVERNAME="${2}"
SS_TAR="s3://${1}/stackstudio.tar.gz"
HOME="/home/sstudio"
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
create_ss_apache_config()
{
	conf="/tmp/stackstudio.conf"
	cat > "${conf}" <<-EOF
		<VirtualHost *:80>
		  ServerAdmin sstudio@localhost
		  ServerName ${SERVERNAME}
		  DocumentRoot ${HOME}/StackStudio/public
		  <Directory ${HOME}/StackStudio/public/bin>
		    Options Indexes FollowSymLinks -MultiViews
		    AllowOverride all
		    Order allow,deny
		    allow from all
		  </Directory>
		  RackEnv production
		  RailsEnv production
		  PassengerMinInstances 5
		  PassengerPreStart https://stackstudio.transcendcomputing.com/bin/C9.html
		  ErrorLog /var/log/httpd/stackstudio-error_log
		  LogLevel warn
		  CustomLog /var/log/httpd/stackstudio-access_log combined
		  RewriteEngine On
		  RewriteCond %{HTTP:X-Forwarded-Proto} !https
		  RewriteRule !/hc.html https://%{SERVER_NAME}%{REQUEST_URI} [L,R]
		</VirtualHost>
	EOF
	chmod 644 "${conf}"
}

install_stackstudio()
{
	#--- cd into <UI dir>/StackStudio/
	cd ${HOME}

	#--- get the code
	logmsg "Grabbing stackstudio source ..."
	s3cmd --config=/etc/s3cfg get "${SS_TAR}" ${HOME} --force
	tar xzf "${HOME}/stackstudio.tar.gz"

	#--- run "bundle install" (this will install required gems, including right_aws)
	cd ${HOME}/StackStudio
	#. ${HOME}/.rvmrc
	#rvm use ${RUBY_VERSION}@sstudio
	rvm use 1.9.2
	gem install bundler --no-ri --no-rdoc
	bundle install --without development test

	create_ss_apache_config
}

change_dir_permissions()
{
	#--- Change permissions to allow apache access to UI files
	logmsg "Setting directory permissions ..."
	chmod 755 ${HOME}/StackStudio
	find ${HOME}/StackStudio -type d -exec chmod 755 {} \;
	find ${HOME}/StackStudio -type f -exec chmod 644 {} \;
}

setup_sstudio_rvm()
{
        rvm user gemsets
	. ${HOME}/.rvmrc
	rvm gemset create sstudio
	rvm use ${RUBY_VERSION}@sstudio --default
}

###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ###### 
#--- Source bashrc
. ${HOME}/.bashrc

###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ###### 
#--- Configure general OS level files.
export PATH="${PATH}:/usr/local/bin"

logmsg "Installing rvm for sstudio user"
#setup_sstudio_rvm
logmsg "Starting stackstudio install ..."
install_stackstudio ${1}
change_dir_permissions
logmsg "... finished stackstudio install."
