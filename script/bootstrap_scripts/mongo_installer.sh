#!/bin/bash

###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ######
#--- Logger stuff has to exist before called, so make it early
LOGFILE="/tmp/stackstudio_install.log"

logmsg()
{
	echo "$(date): $1" 2>&1 | tee -a ${LOGFILE}
}

###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ######
#--- Globals

POSIXLY_CORRECT=1

# Get the parameters into something readable
MONGOUSER="${1}"
MONGOPASSWD="${2}"
MONGODB="${3}"
EBSATTACH="${4}"
INSTALLER_BUCKET="${5}"

NEWDB="false"
DBDIR="/srv"

#MONGOURL="http://fastdl.mongodb.org/linux/mongodb-linux-x86_64-2.0.2.tgz"
MONGOURL="http://fastdl.mongodb.org/linux/mongodb-linux-i686-2.0.2.tgz"

# we have to install the stackplace site for access to the seed routines
SPINSTALLER="sp_installer.sh"
GITKEY="go9Vie8jooghei1o"

###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ######
#--- Functions for use to keep the main line clean

test_args()
{
	if [ "${EBSATTACH}" == "" ]; then
		logmsg "ERROR: Insufficient arges to $0."
		logmsg "  usage: $0 mongoDBUserName mongoDBPassword mongoDBName ebsDeviceName."
		logmsg "  example: $0 mongoguy agoodpassword mymongodb /dev/sdf"
		exit 1
	fi

}

mount_mongo_volume()
{
	# Wait for the EBS volume to show up.
	while [ ! -e ${EBSATTACH} ]; do
		logmsg "Waiting for EBS volume to attach to ${EBSATTACH} ..."
		sleep 5
	done
	logmsg "Mongo DB EBS volume attached on ${EBSATTACH}."

	logmsg "Checking if file system exists on ${EBSATTACH} ..."
	mkdir -p ${DBDIR}
	file -s ${EBSATTACH} >/dev/null 2>&1
	if [ $? -eq 0 ]; then
		# The volume was a valid drive already, so not a new db
		logmsg "File system exists on Mongo EBS volume -- mounting on \"${DBDIR}\"."
		mount ${EBSATTACH} ${DBDIR}
	else
		logmsg "No file system on Mongo EBS volume, formatting and mounting on \"${DBDIR}\"."
		if [ -e ${EBSATTACH}1 ]; then
			/sbin/mkfs -f -t ext4 ${EBSATTACH}1
			mount ${EBSATTACH}1 ${DBDIR}
		else
			/sbin/mkfs -f -t ext4 ${EBSATTACH}
			mount ${EBSATTACH} ${DBDIR}
		fi
	fi
}

install_mongodb()
{
	yum install -y git tcsh scons gcc-c++ glibc-devel boost-devel pcre-devel js-devel readline-devel boost-devel-static readline-static ncurses-static

	# grab and install MongoDB
	curl "${MONGOURL}" >mongo.tgz
	tar xzf mongo.tgz
	rm -f mongo.tgz
	mv mongodb* /opt/mongodb

	# Create the requisite db directories
	rm -f mongodb-linux-i686-1.6.2.tgz

	# Determine if the db requires 'seeding'
	if [ -d ${DBDIR}/db/mongodb ]; then
		logmsg "Directory ${DBDIR}/db/mongodb exists -- assuming good DB"
		NEWDB="false"
	else
		logmsg "Directory ${DBDIR}/db/mongodb does not exist -- assuming new DB"
		NEWDB="true"
		rm -rf ${DBDIR}/db
		mkdir -p ${DBDIR}/db/mongodb
		touch ${DBDIR}/db/mongodb.log
		mkdir -p /opt/bin/
		mkdir -p /opt/config/
	fi
}

build_init_scripts()
{
	# build a set process start and stop files
	cat >/opt/bin/mongodb-stop <<-EOF
		#!/bin/bash
		pid=\`ps -o pid,command ax | grep mongod | awk '!/awk/ && !/grep/ {print \$1}'\`;
		if [ "\${pid}" != "" ]; then
			    kill -2 \${pid};
		fi
	EOF
	chmod +x /opt/bin/mongodb-stop

	cat >/opt/bin/mongodb-start <<-EOF
		#!/bin/sh
		/opt/mongodb/bin/mongod --config /opt/config/mongodb

		## runs a database upgrade option if needed
		#/opt/bin/mongod --config /opt/config/mongodb --upgrade
	EOF
	chmod +x /opt/bin/mongodb-start
}

build_mongo_config()
{
	# build a configuration file
	mkdir -p /opt/config
	cat >/opt/config/mongodb <<-EOF
		# Configuration Options for MongoDB
		#
		# For More Information, Consider:
		# - Configuration Parameters: http://www.mongodb.org/display/DOCS/Command+Line +Parameters
		# - File Based Configuration: http://www.mongodb.org/display/DOCS/File+Based +Configuration
		dbpath = ${DBDIR}/db/mongodb
		logpath = ${DBDIR}/db/mongodb.log
		logappend = true
		#bind_ip = 127.0.0.1
		port = 27017
		fork = true
		auth = true
		noauth = true
	EOF
}

build_sysinit_scripts()
{
	# setup system init scripts
	cat >/etc/rc.d/init.d/mongodb <<-EOF
		#!/bin/sh
		#
		# mongodb --- this script starts and stops the mongodb daemon
		#
		# chkconfig: - 85 15
		# description: MongoDB is a non-relational database storage system.
		# processname: mongodb
		# config: /opt/config/mongodb
		# pidfile: /opt/mongodb/mongo.pid

		PATH=/opt/mongodb/bin:/sbin:/bin:/usr/sbin:/usr/bin
		NAME=mongodb

		test -x \$DAEMON || exit 0

		set -e

		case "\$1" in
			start)
				echo -n "Starting MongoDB... "
				su - mongodb -c "/opt/bin/mongodb-start"
				;;
			stop)
				echo -n "Stopping MongoDB"
				/opt/bin/mongodb-stop
				;;
			*)
				N=/etc/init.d/\$NAME
				echo "Usage: \$N {start|stop}" >&2
				exit 1
				;;
		esac

		exit 0
	EOF
	chmod +x /etc/rc.d/init.d/mongodb /etc/init.d/mongodb
}

set_permissions()
{
	# add the user and set directory and file permissions prior to starting
	useradd -M -r --home-dir /opt/mongodb mongodb
	chown mongodb:mongodb -R ${DBDIR}/db/
}

set_bootopts()
{
	# make sure MongoDB starts at boot, in the even a reboot occurs
	chkconfig --add mongodb
	chkconfig --level 35 mongodb on
}

start_mongodb()
{
	# start the beast
	/etc/init.d/mongodb start

	# give some time to establish the tcp ports
	sleep 10

	# setup user info if required
	if [ "${NEWDB}" == "true" ]; then
		logmsg "Since assuming new DB, creating user ${MONGOUSER}."
		cd /opt/mongodb/bin
		./mongo <<-EOF
			use admin
			db.addUser("transcendadmin", "${MONGOPASSWD}")
			db.auth("transcendadmin", "${MONGOPASSWD}")
			use ${MONGODB}
			db.addUser("${MONGOUSER}", "${MONGOPASSWD}")
		EOF
	fi
}

seed_mongo()
{
	logmsg "Getting sp_installer.sh."
	curl -s ${1}/${GITKEY} >/root/.ssh/gitkey.pem
	curl -s ${1}/${SPINSTALLER} >/tmp/${SPINSTALLER}
	chmod +x /tmp/${SPINSTALLER}

	logmsg "Calling the sp_installer as: /tmp/${SPINSTALLER} ${1} ${2}"
	/tmp/${SPINSTALLER} ${1} ${2}

	logmsg "Generating seed script at /tmp/mongoseed.sh"
	cat >"/tmp/mongoseed.sh" <<-EOF
		#!/bin/bash
		. /usr/local/etc/stack.env
		export RACK_ENV=production
		export RAILS_ENV=production
		export MONGO_URI=mongodb://${MONGOUSER}:${MONGOPASSWD}@localhost:27017/${MONGODB}
		cd \${HOME}/stack-core >/tmp/mongoseed.log 2>&1
		bundle exec rake db:seed >/tmp/mongoseed.log 2>&1
	EOF

	logmsg "Executing: su -c \"/tmp/mongoseed.sh\" - spapi"
	rm -f /tmp/mongoseed.log
	chmod +x /tmp/mongoseed.sh
	su -c "/tmp/mongoseed.sh" - spapi

	logmsg "Finished seeding mongo."
}

###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ######
#--- Mainline code

test_args
mount_mongo_volume
install_mongodb
build_init_scripts
build_mongo_config
build_sysinit_scripts
set_permissions
set_bootopts
start_mongodb
#seed_mongo ${SCRIPTURL} "production"

logmsg "MongoDB installer finished."

# end of script
