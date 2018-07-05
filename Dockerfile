FROM ubuntu:18.04

ARG DEBIAN_FRONTEND=noninteractive

#----------------------------------------------------------
# Install common dependencies and create default entrypoint
#----------------------------------------------------------
ENV LANG="en_US.UTF-8" \
    LC_ALL="C.UTF-8" \
    ND_ENTRYPOINT="/deap-startup.sh"

RUN apt-get update -qq && apt-get install -yq --no-install-recommends  \
        apache2 \
        apt-utils \
        build-essential \
        bzip2 \
        ca-certificates \
        cron \
        curl \
        ed \
        gfortran \
        git \
        libblas-dev \
        liblapack-dev \
        locales \
        nodejs \
        npm \
        php \
        rsync \
        sudo \
        unzip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* \
    && rm /var/www/html/index.html \
    && git clone https://github.com/ABCD-STUDY/DEAP.git /var/www/html \
    && cd /var/www/html \
    && git checkout containerize \
    && cd /var/www/html/applications/Ontology/searchServer \
    && npm install . \
    && groupadd processing -g 1000 \
    && useradd -ms /bin/bash processing -u 1000 -g 1000 -d /home/processing \
    && CRONTAB_DIR=/var/spool/cron/crontabs \
    && PROCESSING_CRONTAB=$CRONTAB_DIR/processing \
    && ROOT_CRONTAB=$CRONTAB_DIR/root \
    && echo '*/1 * * * * /usr/bin/node /var/www/html/applications/Ontology/searchServer/index.js >> /var/www/html/applications/Ontology/searchServer/log.log 2>&1' > $PROCESSING_CRONTAB \
    && echo '*/1 * * * * cd /var/www/html/applications/ModelBuilder/viewer/recipes; git add `ls *.json`; git commit -m "`date`"' >> $PROCESSING_CRONTAB \
    && echo '*/5 * * * * /var/www/html/applications/ModelBuilder/Rserve/run_rserve.sh >> /var/www/html/applications/ModelBuilder/Rserve/log.log 2>&1' >> $ROOT_CRONTAB \
    && chown processing:crontab $PROCESSING_CRONTAB \
    && chown root:crontab $ROOT_CRONTAB \
    && chmod 0600 $PROCESSING_CRONTAB \
    && chmod 0600 $ROOT_CRONTAB \
    && localedef --force --inputfile=en_US --charmap=UTF-8 C.UTF-8

RUN if [ ! -f "$ND_ENTRYPOINT" ]; then \
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
         && echo 'fi' >> $ND_ENTRYPOINT \
         && echo 'touch /var/www/html/applications/Ontology/searchServer/log.log' >> $ND_ENTRYPOINT \
         && echo 'chmod a+w /var/www/html/applications/Ontology/searchServer/log.log' >> $ND_ENTRYPOINT \
         && echo 'alias deap="cd /var/www/html/" >> /root/.bashrc;' >> $ND_ENTRYPOINT \
         && echo 'cron' >> $ND_ENTRYPOINT \
         && echo 'apachectl -D FOREGROUND' >> $ND_ENTRYPOINT \
         && echo "ServerName localhost" >> /etc/apache2/apache2.conf; \
       fi \
    && chmod -R 777 /deap-startup.sh

RUN apt-get update -qq && apt-get install -yq --no-install-recommends \
    r-base \
    r-cran-rserve \
    zlib1g-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* \
    && Rscript -e 'install.packages("gamm4", repos="https://cran.rstudio.com")' \
    && Rscript -e 'install.packages("rjson", repos="https://cran.rstudio.com")' \
    && Rscript -e 'install.packages("stargazer", repos="https://cran.rstudio.com")' \
    && Rscript -e 'install.packages("caret", repos="https://cran.rstudio.com")' \
    && Rscript -e 'install.packages("OpenMx", repos="https://cran.rstudio.com")' \
    && Rscript -e 'install.packages("knitr", repos="https://cran.rstudio.com")' \
    && Rscript -e 'install.packages("MuMIn", repos="https://cran.rstudio.com")' \
    && Rscript -e 'install.packages("R.matlab", repos="https://cran.rstudio.com")' \
    && Rscript -e 'install.packages("tableone", repos="https://cran.rstudio.com")' 


EXPOSE 80
ENTRYPOINT ["/deap-startup.sh"]
