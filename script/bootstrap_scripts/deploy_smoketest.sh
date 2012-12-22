#!/bin/sh

### ###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ###
### Global setup

DOWORDPRESS=0

dbpass="`awk 'BEGIN {FS="="} /RDS_PASSWORD/ {print $2}' /usr/local/etc/stack.env`"
dbadmin="`awk 'BEGIN {FS="="} /RDS_USER/ {print $2}' /usr/local/etc/stack.env`"
dbhost="`awk 'BEGIN {FS="="} /RDS_HOST/ {print $2}' /usr/local/etc/stack.env`"
dbname="`awk 'BEGIN {FS="="} /RDS_DB/ {print $2}' /usr/local/etc/stack.env`"

### ###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ###
### Sanity checks

# see if the wordpress db exists
echo "------------------------------------------------------------------------"
echo ""
if [ ${DOWORDPRESS} -eq 0 ]; then
	echo "WARNING: NOT testing wordpress database connection."
else
	echo "Testing wordpress database connection:"
	mysql -u ${dbadmin} -h ${dbhost} --password="${dbpass}" -e "SHOW DATABASES LIKE 'wordpress'" | grep wordpress
	if [ $? -eq 0 ]; then
		echo "Wordpress RDS database exists."
	else
		echo "ERROR: Wordpress RDS database not found."
	fi
fi
	echo ""

# see if the StackStudio db exists
echo "Testing StackStudio database connection:"
mysql -u ${dbadmin} -h ${dbhost} --password="${dbpass}" -e "SHOW DATABASES LIKE '${dbname}'" | grep ${dbname}
if [ $? -eq 0 ]; then
	echo "${dbname} RDS is accessible."
else
	echo "ERROR: ${dbname} RDS database NOT found."
fi
echo ""

# see if mongo is available
echo "Testing StackPlace MongoDB connection:"
if [ -e /opt/mongodb/bin/test_mongodb ]; then
	/opt/mongodb/bin/test_mongodb >/dev/null 2>&1
	if [ $? -eq 0 ]; then
		echo "MongoDB is accessible."
	else
		echo "ERROR: MongoDB is NOT accessible."
	fi
else
	echo "ERROR: /opt/mongodb/bin/test_mongodb does not exist."
fi
echo ""

echo "Done."
echo ""
echo "------------------------------------------------------------------------"
