
###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ######
#--- Logger stuff has to exist before called, so make it early
LOGFILE="/tmp/ss_codeupdate.log"

logmsg()
{
	echo "$(date): ${1}" 2>&1 | tee -a ${LOGFILE}
}

###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ######
#--- Globals

SSHOME="/home/sstudio"
GEM="/usr/local/bin/gem"
SSTUDIO="${SSHOME}/StackStudio"

###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ######
#--- functions for use to keep the main line clean
install_stackstudio()
{
	#--- cd into <UI dir>/StackStudio/
	cd ${SSHOME}

	#--- get the code
	logmsg "Unpacking stackstudio tar"
	sudo tar xvzf "stackstudio.tar.gz"
	rm "stackstudio.tar.gz"
	logmsg "stackstudio upacked"
}


set_ss_permissions()
{
	#--- Change permissions to allow apache access to UI files
	logmsg "Setting directory permissions ..."
	cd "${SSHOME}"
	sudo chmod 755 ${SSTUDIO}
	sudo find ${SSTUDIO} -type d -exec chmod 755 {} \;
	sudo find ${SSTUDIO} -type f -exec chmod 644 {} \;
	sudo chown -R sstudio:sstudio StackStudio

}


run_ss_bundle_update()
{
	#--- run bundle update
	cd "${SSHOME}/StackStudio"
	source /etc/profile.d/rvm.sh
	bundle install --without development test --path .
}



run_rails_migrations()
{
	#--- run rails migrations
	cd ${SSHOME}/ToughUI
	logmsg "Running migrations...."
	echo "cd ${SSHOME}/ToughUI; bundle exec rake db:migrate" > "/tmp/rails_migration.sh"
	chmod +x "/tmp/rails_migration.sh"
	sudo "/tmp/rails_migration.sh"

}

tail_logs()
{
	#cd ${SSHOME}/ToughUI
	#tail log/production.log

	logmsg "Tailing access logs..."
	sudo tail "/var/log/httpd/stackstudio-access_log"
	logmsg "Tailing error logs..."
	sudo tail "/var/log/httpd/stackstudio-error_log"
	logmsg "Tailing production log..."
	sudo tail "${SSTUDIO}/log/production.log"
}

restart_server()
{
	logmsg "Restarting ${SS_WEB_SERVER} server..."
	sudo /etc/init.d/apache2 restart
	logmsg "${SS_WEB_SERVER} server restarted"
}


run_tasks()
{
	#--- run cloud migration
	cd ${SSHOME}/ToughUI
	
	echo "echo \"Run necessary tasks\"" >> "/tmp/run_tasks.sh"
	echo "cd ${SSHOME}/ToughUI; bundle exec rake tmp:clear --trace" > "/tmp/run_tasks.sh"
	#echo "cd ${SSHOME}/ToughUI; bundle exec rake api:add_image_mappings --trace" >> "/tmp/run_tasks.sh"

	chmod +x "/tmp/run_tasks.sh"
	sudo "/tmp/run_tasks.sh"
}

###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ######
#--- Make some 'niceties' in for logins

###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ######
#--- Configure general OS level files.
export PATH="${PATH}:/usr/local/bin"

logmsg "Starting stackstudio install ..."
install_stackstudio
set_ss_permissions
run_ss_bundle_update
#run_rails_migrations
#tail_logs
#run_tasks
restart_server
logmsg "... finished stackstudio install."


