#!/bin/bash

###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ######
#--- Globals
TOUGHUI="${HOME}/tmp/ToughUI"

###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ######
#--- Sanity Checks

###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ######
#--- Truncate projects and clouds
truncate_tests()
{
        echo "Truncating clouds and projects..."
	cd "${HOME}/rails_apps/stackplace/stack-core/"
	bundle exec rake db:truncate_tests
	cd /media/ToughUI
}

###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ######
#--- Create tmp directory and copy ToughUI code.  Also, remove any svn directories
run_migration()
{
    echo "Migrating mysql to mongo"
    cd "/media/ToughUI"
    bundle exec rake api:migrate_clouds

}

truncate_tests
run_migration
echo "Migration complete"

