#!/bin/sh

### --------------------------------------------------------------------------#
### General setup

SPINSTALLER="sp_installer.sh"
HOMEDIR="/home"
SC_TAR="s3://${1}/stackcore.tar.gz"
SW_TAR="s3://${1}/stackweb.tar.gz"
SITEPREFIX="nositeprefix-"

DEBUG=1

###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ###### 
#--- Logger stuff has to exist before called, so make it early
LOGFILE="/tmp/sp_install.log"

logmsg()
{
	echo "$(date): ${1}" 2>&1 | tee -a ${LOGFILE}
}

###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ###### 
#--- Globals

GEM="/usr/local/bin/gem"

###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ###### 
#--- Sanity Checks

if [ "${1}" == "" ]; then
	logmsg "ERROR: insufficient arbuments to $0."
	logmsg "usage: $0 url_for_scripts host_prefix"
	logmsg "defaulting to S3 TranscendTemplate Bucket."
else
	SC_TAR="s3://${1}/stackcore.tar.gz"
	SW_TAR="s3://${1}/stackweb.tar.gz"
fi

if [ "${2}" == "" -o "${2}" == "production" ]; then
	logmsg "WARNING: USING PRODUCTION URLS."
	SITEPREFIX=""
else
	SITEPREFIX="${2}"
fi

###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ###### 
#--- Globals

install_mongo_client()
{
	MONGOURL="http://fastdl.mongodb.org/linux/mongodb-linux-x86_64-2.0.7.tgz"
	MONGO_URI="`awk 'BEGIN {FS="="} /MONGO_URI/ {print $2}' /usr/local/etc/stack.env`"
	MONGOADDR=$(echo "${MONGO_URI}" | awk 'BEGIN{FS="@"} {print $2}' | awk 'BEGIN{FS=":"} {print $1}')
	MONGOUSER=$(echo "${MONGO_URI}" | awk 'BEGIN{FS="@"} {print $1}' | awk 'BEGIN{FS=":"} {print $2}' | cut -d/ -f3)
	MONGOPASSWD=$(echo "${MONGO_URI}" | awk 'BEGIN{FS="@"} {print $1}' | awk 'BEGIN{FS=":"} {print $3}')
	MONGODB=$(echo "${MONGO_URI}" | awk 'BEGIN{FS="@"} {print $2}' | awk 'BEGIN{FS=":"} {print $2}' | cut -d/ -f2)

	if ! [ -d /opt/mongodb ]; then
		yum install -y git tcsh scons gcc-c++ glibc-devel boost-devel pcre-devel js-devel readline-devel boost-devel-static readline-static ncurses-static

		# grab and install MongoDB
		curl "${MONGOURL}" >mongo.tgz
		tar xzf mongo.tgz
		rm -f mongo.tgz
		mv mongodb* /opt/mongodb
	fi
	
	cat >/opt/mongodb/bin/test_mongodb <<-EOF
		#!/bin/bash
		MONGOURL=${MONGOURL}
		MONGO_URI="`awk 'BEGIN {FS="="} /MONGO_URI/ {print \$2}' /usr/local/etc/stack.env`"
		MONGOADDR=\$(echo "\${MONGO_URI}" | awk 'BEGIN{FS="@"} {print \$2}' | awk 'BEGIN{FS=":"} {print \$1}')
		MONGOUSER=\$(echo "\${MONGO_URI}" | awk 'BEGIN{FS="@"} {print \$1}' | awk 'BEGIN{FS=":"} {print \$2}' | cut -d/ -f3)
		MONGOPASSWD=\$(echo "\${MONGO_URI}" | awk 'BEGIN{FS="@"} {print \$1}' | awk 'BEGIN{FS=":"} {print \$3}')
		MONGODB=\$(echo "\${MONGO_URI}" | awk 'BEGIN{FS="@"} {print \$2}' | awk 'BEGIN{FS=":"} {print \$2}' | cut -d/ -f2)

		trap "rm -f /tmp/mongotest.log" 0 1 2 3 15
		# setup user info if required
		cd /opt/mongodb/bin
		./mongo \${MONGOADDR} >/tmp/mongotest.log 2>&1 <<-EOC
			use \${MONGODB}
			db.auth("\${MONGOUSER}", "\${MONGOPASSWD}")
		EOC
		grep '1\$' /tmp/mongotest.log >/dev/null 2>&1
		testval=\$?
		echo "\${testval}" >/tmp/mongostatus.log
		exit \${testval}
	EOF
	chmod 755 /opt/mongodb/bin/test_mongodb
}



###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ###### 
#--- Configure general OS level files.
export PATH="${PATH}:/usr/local/bin"


###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ###### 
#--- Create and run the relevant users and installers for them
install_mongo_client
