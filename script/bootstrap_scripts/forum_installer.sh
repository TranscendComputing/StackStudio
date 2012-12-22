#!/bin/bash

### ###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ###
### Global setup

encrypt="${1}"
shift
initDB="${1}"
shift
siteurl="${1}"
shift
siteprefix="${1}"
shift
cryptpass="${1}"
shift

dbpass="`awk 'BEGIN {FS="="} /RDS_PASSWORD/ {print $2}' /usr/local/etc/stack.env`"
dbadmin="`awk 'BEGIN {FS="="} /RDS_USER/ {print $2}' /usr/local/etc/stack.env`"
dbhost="`awk 'BEGIN {FS="="} /RDS_HOST/ {print $2}' /usr/local/etc/stack.env`"

dbname="forums"
dbseed="install_2-0_mysql.sql"

sitedir="/var/www/html/forums"
vhostconf="/etc/httpd/conf.d/vhosts/forums-transcend.conf"

### ###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ###
### Sanity checks

usage()
{
	echo "ERROR: insufficient parameters."
	echo "usage: $0 encrypt file [file ...]"
	echo "or:"
	echo "usage: $0 decrypt initDB|noInitDB tarball_url siteprefix cryptpass"
	echo "  Also, the file /usr/local/etc/stack.env must contain credential info."
	exit 2
}

if [ "${encrypt}" == "" ]; then
	usage
fi

if [ "${initDB}" == "" ]; then
	usage
fi

if [ "${siteurl}" == "" ]; then
	usage
fi

if [ "${siteprefix}" == "production" -o "${siteprefix}" == "production-" ]; then
    siteprefix=""
else
    siteprefix="${siteprefix}-"
fi

if [ "${cryptpass}" == "" ]; then
	# for a short period, while we roll over this new param, default it
	cryptpass="M@mentum3I"
fi

if [ "${dbpass}" == "" ]; then
	usage
fi

if [ "${dbadmin}" == "" ]; then
	usage
fi

if [ "${dbhost}" == "" ]; then
	usage
fi

###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ###### 
#--- Logger stuff has to exist before called, so make it early

LOGFILE="/tmp/forum_installer.log"

logmsg()
{
	echo "$(date): ${1}" 2>&1 | tee -a ${LOGFILE}
}

### ###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ###
### Convenience functions
install_php()
{
	echo "Installing php and php-mysql."
	yum install -y php php-mysql
}

get_domain_name()
{
	if [ "${1}" == "" ]; then
		echo "transcendcomputing.com"
	else
		echo "sdlc.transcendcomputing.com"
    fi
}

create_apache_conf()
{
    local domain="$(get_domain_name ${1})"

	logmsg "Creating apache conf file for forums.transcendcomputing.com ..."
	cat >${vhostconf} <<-EOF
		<VirtualHost *:80>
		  ServerAdmin root@localhost
		  ServerName ${1}forums.${domain}
		  DocumentRoot ${sitedir}
		  <Directory ${sitedir}>
		    Options Indexes FollowSymLinks -MultiViews
		    AllowOverride all
		    Order allow,deny
		    allow from all
		  </Directory>
		  ErrorLog /var/log/httpd/forums-transcend-error_log
		  LogLevel warn
		  CustomLog /var/log/httpd/forums-transcend-access_log combined
		  #RewriteEngine Off
		  RewriteEngine On
		  RewriteCond %{HTTP:X-Forwarded-Proto} !https
		  RewriteRule !/hc.html https://%{SERVER_NAME}%{REQUEST_URI} [L,R]
		</VirtualHost>
	EOF
}

fixup_forums_db()
{
	# NOTE: if using apache redirection to https, change the http to https below.
	logmsg "Fixing up DB to correct any latent installation defects."
	#mysql --password="${dbpass}" -u "${dbadmin}" -h "${dbhost}" ${dbname}  <FIXME.FILE
}

### ###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ###
### Mainline code


#Get and decrypt the site
if [ "${encrypt}" == "dump" ]; then
	if [ "${initDB}" == "initDB" ]; then
		mysql --password="${dbpass}" -u "${dbadmin}" -h "${dbhost}" <<-EOF
			drop database ${dbname};
		EOF
	fi
	rm -rf ${sitedir}
	rm -rf /root/forums
	rm -f ${vhostconf}
elif [ "${encrypt}" == "true" ]; then
	tar czf - $@ | gpg -c --passphrase ${cryptpass} --disable-mdc >forums.gpg
else
	install_php

	logmsg "Getting and unpacking the forum site from: ${siteurl}."
	mkdir -p /root/forums
	pushd /root/forums
	curl -s ${siteurl} >forums.tgz
	#tar -xzf <(cat twp.gpg | gpg -d --batch --no-mdc-warning --passphrase $cryptpass)
	tar -xzf forums.tgz
	rm -f forums.tgz
	rm -f twp.gpg
	popd

	# place the site into the directory
	logmsg "Placing the forum at \"$(dirname ${sitedir})/\"."
	mv forums "$(dirname ${sitedir})/"
	chown -R apache:apache ${sitedir}

	if [ "${initDB}" == "__never_do_this__" ]; then
		# create the db on the RDS instance
		logmsg "Creating the forum DB on ${dbhost}."
		mysqladmin --password="${dbpass}" -u "${dbadmin}" -h "${dbhost}" -v create ${dbname}

		# grant privileges
		logmsg "Granting privileges to ${dbadmin} on ${dbname}"
		mysql --password="${dbpass}" -u "${dbadmin}" -h "${dbhost}" <<-EOF
			GRANT ALL PRIVILEGES ON ${dbname}* TO ${dbadmin};
		EOF

		# restore the site db
		logmsg "Restoring the forums site db to ${dbhost}."
		mysql --password="${dbpass}" -u "${dbadmin}" -h "${dbhost}" --default-character-set=utf8 ${dbname} < ${dbseed}

		fixup_forums_db
	fi

	create_apache_conf ${siteprefix}
fi
