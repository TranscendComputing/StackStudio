#!/bin/sh

###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ###### 
#--- Parameters

###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ###### 
#--- Global defaults

MONGOURL="http://fastdl.mongodb.org/linux/mongodb-linux-i686-2.0.2.tgz"

MONGO_URI="`awk 'BEGIN {FS="="} /MONGO_URI/ {print $2}' /usr/local/etc/stack.env`"

MONGOADDR=$(echo "${MONGO_URI}" | awk 'BEGIN{FS="@"} {print $2}' | awk 'BEGIN{FS=":"} {print $1}')
MONGOUSER=$(echo "${MONGO_URI}" | awk 'BEGIN{FS="@"} {print $1}' | awk 'BEGIN{FS=":"} {print $2}' | cut -d/ -f3)
MONGOPASSWD=$(echo "${MONGO_URI}" | awk 'BEGIN{FS="@"} {print $1}' | awk 'BEGIN{FS=":"} {print $3}')
MONGODB=$(echo "${MONGO_URI}" | awk 'BEGIN{FS="@"} {print $2}' | awk 'BEGIN{FS=":"} {print $2}' | cut -d/ -f2)

#echo \"$MONGOADDR\" \"$MONGOUSER\" \"$MONGOPASSWD\" \"$MONGODB\"
#exit 1

###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ###### 
#--- Logger stuff has to exist before called, so make it early
LOGFILE="/dev/null"

logmsg()
{
	echo "$(date): $1" 2>&1 | tee -a ${LOGFILE}
}

install_mongo_client()
{
	if ! [ -d /opt/mongodb ]; then
        	yum install -y git tcsh scons gcc-c++ glibc-devel boost-devel pcre-devel js-devel readline-devel boost-devel-static readline-static ncurses-static

        	# grab and install MongoDB
        	curl "${MONGOURL}" >mongo.tgz
        	tar xzf mongo.tgz
        	rm -f mongo.tgz
        	mv mongodb* /opt/mongodb
	fi
}

test_mongodb()
{
	trap "rm -f /tmp/mongotest.log" 0 1 2 3 15
        # setup user info if required
	cd /opt/mongodb/bin
	./mongo ${MONGOADDR} >/tmp/mongotest.log 2>&1 <<-EOF
		use ${MONGODB}
		db.auth("${MONGOUSER}", "${MONGOPASSWD}")
	EOF
	grep '1$' /tmp/mongotest.log >/dev/null 2>&1
	echo $? >/tmp/mongostatus.log
}

###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ###### 
#--- Main line code

install_mongo_client
test_mongodb
