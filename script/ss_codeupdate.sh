#!/bin/bash

###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ######
#--- Logger stuff has to exist before called, so make it early

logmsg()
{
	echo "$(date): $1" 2>&1
}

###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ######
#--- Globals

SSURL="${1}/stackstudio.tar.gz"
SSHKEY="${2}"

###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ######
#--- Sanity Checks

if [ "${1}" == "" -o "${2}" == "" ]; then
	echo "usage: $0 ss3_bucket_url pem_file instance_dnsname [instance_dnsname ...]"
else
	shift
	shift
fi

run_update()
{
	#scp -i "${2}" "/media/StackStudio/app/controllers/provisioning_controller.rb" "ec2-user@${3}:/home/ec2-user"
	# generate the script to remotely execute
	cat >/tmp/codescript.sh <<-EOF
		#!/bin/sh
		SSURL="${1}"
	EOF
	cat ss_codeupdate2.sh >>/tmp/codescript.sh
	ssh -i "${2}" "ec2-user@${3}" "$(cat /tmp/codescript.sh)"
}

###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ######
#--- Main line code

for i in $@; do
	run_update ${SSURL} ${SSHKEY} ${i}
done

