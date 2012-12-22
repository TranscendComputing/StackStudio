
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
SPHOME="/home/spapi"
GEM="/usr/local/bin/gem"

###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ######
#--- functions for use to keep the main line clean
install_stackstudio()
{
	#--- cd into <UI dir>/ToughUI/
	cd ${SSHOME}

	#--- get the code
	#logmsg "Grabbing stackstudio source ...${SSURL}"
	#sudo rm -f "${SSHOME}/stackstudio.tar.gz"
	#logmsg "Curling from: ${SSURL}"
	#sudo curl -s "${SSURL}" >"/tmp/stackstudio.tar.gz"
	#sudo cp ${SSHOME}/ToughUI/public/bin/config/config.xml /tmp/
	#sudo cp ${SSHOME}/ToughUI/config/database.yml /tmp/
	#sudo tar xvzf "/tmp/stackstudio.tar.gz"
	#sudo cp /tmp/config.xml ${SSHOME}/ToughUI/public/bin/config/
	#sudo cp /tmp/database.yml ${SSHOME}/ToughUI/config/

	sudo mv "/home/ec2-user/provisioning_controller.rb" "${SSHOME}/ToughUI/app/controllers"
	sudo chown sstudio:sstudio "${SSHOME}/ToughUI/app/controllers/provisioning_controller.rb"
	sudo chmod 644 "${SSHOME}/ToughUI/app/controllers/provisioning_controller.rb"

}

change_dir_permissions()
{
	#--- Change permissions to allow apache access to UI files
	logmsg "Setting directory permissions ..."
	sudo chmod 755 ${SSHOME}/ToughUI
	sudo find ${SSHOME}/ToughUI -type d -exec chmod 755 {} \;
	sudo find ${SSHOME}/ToughUI -type f -exec chmod 644 {} \;
	sudo chown -R sstudio:sstudio ToughUI

	#--- run bundle update
	cd ${SSHOME}/ToughUI
	logmsg "$(ls -la)"
	echo "su -c \"cd ${SSHOME}/ToughUI; bundle install --path . --without development test\" - sstudio" > "/tmp/bundle.sh"
	echo "su -c \"cd ${SSHOME}/ToughUI; bundle exec rake tmp:clear\" - sstudio" >> "/tmp/bundle.sh"
	chmod +x "/tmp/bundle.sh"
	sudo "/tmp/bundle.sh"
}

run_rails_migrations()
{
	#--- run rails migrations
	cd ${SSHOME}/ToughUI
	logmsg "Running migrations...."
	echo "su -c \"cd ${SSHOME}/ToughUI; bundle exec rake db:migrate\" - sstudio" > "/tmp/rails_migration.sh"
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
	sudo tail "${SSHOME}/ToughUI/log/production.log"
}

restart_server()
{
    sudo /etc/init.d/httpd restart
}

update_stackplace()
{
	sudo chmod 0600 "${SPHOME}/.ssh/gitkey.pem"
	sudo chown spapi:spapi "${SPHOME}/.ssh/gitkey.pem"
	echo "echo \"Checking out spapi\"" > "/tmp/update_api.sh"
	echo "su -c \"cd ${SPHOME}/stack-core; git pull origin master\" - spapi" >> "/tmp/update_api.sh" 
	#echo "su -c \"cd ${SPHOME}/stack-core; git checkout dev\" - spapi" >> "/tmp/update_api.sh" 
	echo "echo \"Installing gems\"" >> "/tmp/update_api.sh"
	echo "su -c \"cd ${SPHOME}/stack-core; bundle install --without test development --path /home/spapi/stack-core/ruby\" - spapi" >> "/tmp/update_api.sh"
	chmod +x "/tmp/update_api.sh"
	sudo "/tmp/update_api.sh"
}

migrate_cloud()
{
	#--- run cloud migration
	cd ${SSHOME}/ToughUI
	
	echo "echo \"Clearing any test data\"" >> "/tmp/migrate.sh"
	echo "su -c \"cd ${SPHOME}/stack-core; bundle exec rake db:truncate_tests\" - spapi" >> "/tmp/migrate.sh"
	echo "su -c \"cd ${SSHOME}/ToughUI; bundle exec rake api:migrate_clouds --trace\" - sstudio" > "/tmp/migrate.sh"
	echo "su -c \"cd ${SSHOME}/ToughUI; bundle exec rake api:add_elc_iam --trace\" - sstudio" >> "/tmp/migrate.sh"
	echo "su -c \"cd ${SSHOME}/ToughUI; bundle exec rake api:update_endpoints --trace\" - sstudio" >> "/tmp/migrate.sh"

	chmod +x "/tmp/migrate.sh"
	sudo "/tmp/migrate.sh"
}

run_tasks()
{
	#--- run cloud migration
	cd ${SSHOME}/ToughUI
	
	echo "echo \"Run necessary tasks\"" >> "/tmp/run_tasks.sh"
	#echo "su -c \"cd ${SSHOME}/ToughUI; bundle exec rake tmp:clear --trace\" - sstudio" > "/tmp/run_tasks.sh"
	echo "su -c \"cd ${SSHOME}/ToughUI; bundle exec rake api:update_clouds --trace\" - sstudio" >> "/tmp/run_tasks.sh"
	echo "su -c \"cd ${SSHOME}/ToughUI; bundle exec rake api:add_hp --trace\" - sstudio" >> "/tmp/run_tasks.sh"
	echo "su -c \"cd ${SSHOME}/ToughUI; bundle exec rake api:add_rackspace --trace\" - sstudio" >> "/tmp/run_tasks.sh"
	echo "su -c \"cd ${SSHOME}/ToughUI; bundle exec rake api:add_joyent --trace\" - sstudio" >> "/tmp/run_tasks.sh"
	echo "su -c \"cd ${SSHOME}/ToughUI; bundle exec rake api:add_cloudstack --trace\" - sstudio" >> "/tmp/run_tasks.sh"

	chmod +x "/tmp/run_tasks.sh"
	sudo "/tmp/run_tasks.sh"
}

###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ######
#--- Make some 'niceties' in for logins

###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ######
#--- Configure general OS level files.
export PATH="${PATH}:/usr/local/bin"

#logmsg "Starting stackstudio install ..."
#install_stackstudio
#change_dir_permissions
#run_rails_migrations
#logmsg "Updating stackplace..."
#update_stackplace
#logmsg "Migrating mysql info to mongo db..."
#migrate_cloud
#logmsg "Displaying access logs"
#tail_logs
logmsg "Restarting server..."
restart_server
#logmsg "Running tasks..."
#run_tasks
#logmsg "... finished stackstudio install."
