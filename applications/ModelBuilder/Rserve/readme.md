### How to start the Rserve module

```
sudo -u www-data R CMD Rserve  --RS-source ./Rserve/modelbuilder.conf
```

The job is started every 10 minutes by the run_rserve.sh script (root user's cron job).

