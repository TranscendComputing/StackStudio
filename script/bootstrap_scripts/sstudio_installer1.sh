#!/bin/sh

###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ###### 
#--- Parameters
# $1: initDB | noInitDB -- whether or not to initialize the DB.
# $2: ScriptUrl -- the url from which to obtain sub-scripts.
# $3: ServerName -- the servername for stackstudio (apache configs).
# $4: SDLCState -- must be one of dev, test, staging or production.

###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ###### 
#--- Global defaults

INSTALLER="ss_installer.sh"
HOMEDIR="/home"
USER="sstudio"
GEM="/usr/local/bin/gem"
SERVERNAME=${3}
INSTALLER_BUCKET="${1}"
RUBYWRAPPER="/usr/local/bin/ruby_wrapper"

###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ###### 
#--- Logger stuff has to exist before called, so make it early
#LOGFILE="${HOMEDIR}/${USER}/stackstudio_install.log"
LOGFILE="/tmp/stackstudio_install.log"

logmsg()
{
	echo "$(date): $1" 2>&1 | tee -a ${LOGFILE}
}

###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ###### 
#--- Sanity Checks

if [ "${SERVERNAME}" == "" ]; then
	logmsg "ERROR: insufficient arbuments to $0."
	logmsg "usage: $0 initDB|noInitDB url_for_scripts."
	logmsg "Exiting from $0."
	exit 1
fi


###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ###### 
#--- Make some 'niceties' in for logins
cat >>/root/.bashrc <<-EOF
	export EDITOR=vim
	#--- Note: unless ""usr/local/lib" in /etc/ld.so.conf/<some_file>.conf
	#	all accesses to ruby will fail without uncommenting the next line.
	#export LD_LIBRARY_PATH="/usr/local/lib"
	#--- Note: the following export allows root to use the 'local' ruby.
	export PATH="\${PATH}:/usr/local/bin"
EOF

cat >>/home/ec2-user/.bashrc <<-EOF
	export EDITOR=vim
	#--- Note, unless ""usr/local/lib" in /etc/ld.so.conf/<some_file>.conf
	#	all accesses to ruby will fail without uncommenting the next line.
	#export LD_LIBRARY_PATH="/usr/local/lib"
EOF

# --- fixup the default bash profile so restarts correctly re-point ruby
logmsg "Setting up skel."
cat >>/etc/skel/.bash_profile <<-EOF
	### Start Transcend Additions ###
	# Load RVM function
	[[ -s "/usr/local/rvm/scripts/rvm" ]] && . "/usr/local/rvm/scripts/rvm"
	### End Transcend Additions ###
EOF

. /etc/skel/.bash_profile


###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ###### 
#--- functions for use to keep the main line clean

install_dev_tools()
{
	export PATH="${PATH}:/usr/local/bin"
	yum -y update
	yum groupinstall -y "Development Tools"
	yum install -y make libxml2-devel libxslt libxslt-devel httpd-devel
	logmsg "Installing convenience tools."
	yum install -y unzip vim-enhanced
}

install_passenger()
{

	#--- Install passenger and the apache module for it
	logmsg "Installing passenger ..."
	. /usr/local/rvm/scripts/rvm
	. /etc/skel/.bash_profile
	. /etc/profile.d/rvm.sh
	. /usr/local/rvm/environments/ruby-1.9.2-p320@global

	msg=$(/usr/bin/which rvm)
	logmsg "rvm at: ${msg}"
	msg=$(/usr/bin/which rvm)
	logmsg "gem is at: ${msg}"
	rvm use 1.9.2
	gem install passenger --no-ri --no-rdoc
	msg=$(/usr/bin/which passenger-install-apache2-module)
	logmsg "apache module installer is at: ${msg}"
	passenger-install-apache2-module -a
 
	logmsg "PATH is ${PATH}"
	#--- Start httpd
	#touch /etc/httpd/conf.d/stackstudio.conf
	# note: handled by cloud-init if the file gets 'modified'
}

create_apache_files()
{
	# create a ruby wrapper to include the stack.env file
	conf="/usr/local/etc/stack.env"
	logmsg "Adding ${RUBYWRAPPER} (sources stack.env before exec'ing ruby)."
	cat >"${RUBYWRAPPER}" <<-EOF
		#!/bin/sh
		. ${conf}
		exec "$(which ruby)" "\$@"
	EOF
	chmod +x "${RUBYWRAPPER}"

	# fixup apache to support named virtual hosts and ruby
	conf="/etc/httpd/conf/httpd.conf"
	logmsg "Fixing up ${conf} for named virtual hosts."
	confdir="/etc/httpd/conf.d/vhosts"
	mkdir -p ${confdir}
	cat >>${conf} <<-EOF
		# server-status
		ExtendedStatus On
		<Location /server-status>
			  SetHandler server-status
			  Order Deny,Allow
			  Deny from all
			  Allow from localhost
		</Location>
	
		NameVirtualHost *:80
		Include conf.d/vhosts/*.conf
	EOF

	conf="/etc/httpd/conf.d/transcend.conf"
	logmsg "Adding ${conf} ..."
	module="$(find /usr -name mod_passenger.so)"
	modpath="$(dirname $(dirname $(dirname ${module})))"
	cat >${conf} <<-EOF
		# --- This file contains Transcend Computing specific settings ---
		LoadModule file_cache_module modules/mod_file_cache.so
		#LoadModule mem_cache_module modules/mod_mem_cache.so
		LoadModule passenger_module ${module}
		PassengerRoot ${modpath}
		PassengerRuby /usr/local/rvm/wrappers/ruby-1.9.2-p320/ruby
		AddType text/html .rhtml
		AddType text/html .rbx
		<IfModule mod_ruby.c>
		  RubyRequire apache/ruby-run
		  #RubyRequire apache/ruby-debug
		  RubyRequire apache/eruby-run
		  #RubyRequire apache/eruby-debug
		  # Execute *.rbx files as Ruby scripts
		  <Files *.rbx>
		    Options +ExecCGI
		    SetHandler ruby-object
		    RubyHandler Apache::RubyRun.instance
		    #RubyHandler Apache::RubyDebug.instance
		  </Files>
		    # Handle *.rhtml files as eRuby files
		  <Files *.rhtml>
		    SetHandler ruby-object
		    RubyHandler Apache::ERubyRun.instance
		    #RubyHandler Apache::ERubyDebug.instance
		  </Files>
		</IfModule>
	EOF


	# create a default site vhost
	conf="/etc/httpd/conf.d/vhosts/default.conf"
	cat >${conf} <<-EOF
		<VirtualHost *:80>
		  ServerAdmin root@localhost
		</VirtualHost>
	EOF

}

create_user()
{
	# make the stackstudio user and fixup permissions as stackstudio needs
	logmsg "Making user ${1}."
	/usr/sbin/useradd ${1}
	usermod -G rvm ${1}
	chmod 755 ${HOMEDIR}
	chmod 755 ${HOMEDIR}/${1}
	cat >>${HOMEDIR}/${1}/.bashrc <<-EOF
		# --- pull in the stack ruby environment
		. /usr/local/etc/stack.env
		export EDITOR=vim
		#--- Note, unless ""usr/local/lib" in /etc/ld.so.conf/<some_file>.conf
		#	all accesses to ruby will fail without uncommenting the next line.
		#export LD_LIBRARY_PATH="/usr/local/lib"
		[[ -s "/usr/local/rvm/scripts/rvm" ]] && source "/usr/local/rvm/scripts/rvm"
	EOF

}

###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ###### 
#--- Configure general OS level files.


# create a default site health checker file
cat >/var/www/html/hc.html <<-EOF
	<html><body>Yes!</body></html>
EOF


# install our ruby version
logmsg "Starting stackstudio install ..."
install_dev_tools
install_passenger
create_apache_files

logmsg "Installing mongo client"
s3cmd --config=/etc/s3cfg get "s3://${INSTALLER_BUCKET}/mongo_client_installer.sh" "/tmp/mongo_client_installer.sh"
chmod +x "/tmp/mongo_client_installer.sh"
/tmp/mongo_client_installer.sh ${1} ${2}


# make sure the vhosts directory exists prior to running installers
if ! [ -d /etc/httpd/conf.d/vhosts ]; then
	mkdir -p /etc/httpd/conf.d/vhosts
fi

for i in sstudio spapi spweb; do
	create_user ${i}
	# Get the installer script and run it
	logmsg "Getting ${INSTALLER_BUCKET}/${i}_installer.sh for stack studio installer script."
	s3cmd --config=/etc/s3cfg get "s3://${INSTALLER_BUCKET}/${i}_installer.sh" "${HOMEDIR}/${i}/${i}_installer.sh" --force
	chmod +x "${HOMEDIR}/${i}/${i}_installer.sh"

	logmsg "Executing su -c \"${HOMEDIR}/${i}/${i}_installer.sh ${1} ${2} ${SERVERNAME}\" - ${i}"
	su -c "${HOMEDIR}/${i}/${i}_installer.sh ${1} ${2} ${SERVERNAME}" - ${i}

done

for i in stackstudio stack-core stack-web; do
	# the installer creates a temporary file for placement in httpd conf area
	logmsg "Copying ${i}.conf from /tmp to /etc/httpd/conf.d/vhosts/"
	cp "/tmp/${i}.conf" /etc/httpd/conf.d/vhosts/
	chmod 644 "/etc/httpd/conf.d/vhosts/${i}.conf"
done




# install the 'forum.transcendcomputing.com' site
#curl "${2}/forum_installer.sh" >/tmp/forum_installer.sh
#chmod 755 /tmp/forum_installer.sh
#/tmp/forum_installer.sh decrypt ${1} "${2}/smf_2-0-2_install.tar.gz" ${4}
#rm -f /tmp/forum_installer.sh

# restart apache server
service httpd restart

# All done.
logmsg "${0} finished."



















