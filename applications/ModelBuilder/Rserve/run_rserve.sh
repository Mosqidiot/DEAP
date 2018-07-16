#!/bin/bash

#
# check if Rserve is running, restart if not
# (Needs to be run by root user.)
#

pid=`pgrep -f "Rserve.*./Rserve/modelbuilder.conf"`
if [ -z "$pid" ]; then
  echo "`date`: Start Rserve again"
  sudo -u www-data R CMD Rserve --no-save --RS-source /var/www/html/applications/ModelBuilder/Rserve/modelbuilder.conf
else
  echo "`date`: Did not need to start again, still running."
fi
