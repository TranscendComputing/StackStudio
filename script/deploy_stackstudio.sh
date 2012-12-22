#!/bin/bash

###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ######
#--- Globals
TOUGHUI="${HOME}/tmp/ToughUI"

###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ######
#--- Sanity Checks

#if [ "${2}" == "" ]; then
#	echo "ERROR: insufficient arbuments to $0."
#	echo "usage: $0 instance_dns ssh_key_to_instance."
#	exit
#fi
#
#if [ ! -d ../../ToughUI]; then
#    echo "Must run script in ToughUI/script directory"
#    exit
#fi

###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ######
#--- Remove any old ToughUI files
remove_old_files()
{
    echo "Removing old temp ToughUI files."
    rm -f -r ${TOUGHUI}
    rm -f ${HOME}/tmp/stackstudio*
}

###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ######
#--- Create tmp directory and copy ToughUI code.  Also, remove any svn directories
create_tmp_and_copy()
{
    echo "Creating tmp directory '${HOME}/tmp' to send ToughUI code to."
    #if [ ! -d "${HOME}/tmp"]; then
    #mkdir ${HOME}/tmp
    #fi
    cp -r ../../StackStudio ${HOME}/tmp
    mv ${HOME}/tmp/StackStudio ${HOME}/tmp/ToughUI
    find ${HOME}/tmp/ToughUI/ -name ".git" -type d -exec rm -rf {} \;
    rm -r ${HOME}/tmp/ToughUI/windowsEnvironmentSupport/
    rm -r ${HOME}/tmp/ToughUI/app/flex/
}

###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ######
#--- Create config.xml file
create_config()
{
	conf="${HOME}/tmp/ToughUI/public/bin/config/config.xml"
	cat > "${conf}" <<-EOF
		<?xml version="1.0" encoding="utf-8"?>
        <settings>
                  <serviceUrl>https://dev-stackstudio.sdlc.transcendcomputing.com</serviceUrl>
                  <userName></userName>
                  <userPassword></userPassword>
        </settings>
	EOF
	chmod 644 "${conf}"
}

###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ######
#--- Create tar.gz files to scp to instance(s)
create_directory_tars()
{
    echo "Creating tar.gz files that will be sent to instance"
    cd ${HOME}/tmp
    #cd /media/
    tar -zcvf stackstudio.tar.gz ToughUI/
    #tar -zcvf ${HOME}/tmp/stackstudio.tar.gz ToughUI/public/bin/com/momentumsi/c9/assets/ 
    #tar -zcvf stackstudio_app.tar.gz ToughUI/app/
    #tar -zcvf stackstudio_public.tar.gz ToughUI/public/
}

send_public()
{
    echo "Sending public tar to ec2-user@${1}"
    sudo scp -i ${2} ${HOME}/tmp/stackstudio_public.tar.gz ec2-user@${1}:/home/ec2-user
    
}
send_app()
{
    echo "Sending app tar to ec2-user@${1}"
    sudo scp -i ${2} ${HOME}/tmp/stackstudio_app.tar.gz ec2-user@${1}:/home/ec2-user
}
send_ui()
{
    echo "Sending app tar to ec2-user@${1}"
    sudo scp -i ${2} ${HOME}/tmp/stackstudio.tar.gz ec2-user@${1}:/home/ec2-user
}

send_ui()
{
	echo "Sending application to ec2-user@${1}"
	sudo scp -i ${2} ${HOME}/tmp/stackstudio.tar.gz ec2-user@${1}:/home/ec2-user
}

remove_old_files
create_tmp_and_copy
#create_config
create_directory_tars
#send_public ${1} ${2}
#send_app ${1} ${2}
#send_ui ${1} ${2}
echo "Folders have been copied to instance.  Now upload ${HOME}/tmp/stackstudio.tar.gz to TranscendTemplates bucket in S3."
echo "Also, ssh into instance, 'sudo su' and mv tar files from /home/ec2-user to /home/sstudio.  Then untar both by 'tar -zxvf {file}'"

