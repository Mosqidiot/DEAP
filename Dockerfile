FROM ubuntu:18.04

ARG DEBIAN_FRONTEND=noninteractive

#----------------------------------------------------------
# Install common dependencies and create default entrypoint
#----------------------------------------------------------
ENV LANG="en_US.UTF-8" \
    LC_ALL="C.UTF-8" \
    ND_ENTRYPOINT="/deap-startup.sh"
RUN apt-get update -qq && apt-get install -yq --no-install-recommends  \
    	apt-utils bzip2 ca-certificates curl locales unzip rsync apache2 build-essential nodejs npm \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* \
    && localedef --force --inputfile=en_US --charmap=UTF-8 C.UTF-8
    && echo 'alias deap="cd /var/www/html/" >> /root/.bashrc;' >> $ND_ENTRYPOINT \
    && if [ ! -f "$ND_ENTRYPOINT" ]; then \
         echo '#!/usr/bin/env bash' >> $ND_ENTRYPOINT \
         && echo 'set +x' >> $ND_ENTRYPOINT \
         && echo 'if [ -z "$*" ]; then /usr/bin/env bash; else' >> $ND_ENTRYPOINT \
         && echo '  if [ "$1" == "start" ]; then' >> $ND_ENTRYPOINT \
         && echo '    echo "Start system services and apache...";' >> $ND_ENTRYPOINT \
         && echo '    mkdir -p /usr/local/;' >> $ND_ENTRYPOINT \
         && echo '    echo "Copying existing Matlab (please be patient)...";' >> $ND_ENTRYPOINT \
         && echo '    rsync -av --info=name0 --info=progress2 /matlab /usr/local/;' >> $ND_ENTRYPOINT \
         && echo '  else $*;' >> $ND_ENTRYPOINT \
         && echo '  fi' >> $ND_ENTRYPOINT \
         && echo 'fi' >> $ND_ENTRYPOINT; \
       fi \
    && chmod -R 777 /deap-startup.sh
ENTRYPOINT ["/deap-startup.sh"]
RUN apt-get update -qq && apt-get install -yq --no-install-recommends r-base \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# start the Rserv

# start index.js


EXPOSE 80
# start the webserver in the foreground
CMD apachectl -D FOREGROUND
