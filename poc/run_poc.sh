#!/bin/bash
cd /root
node poc.js http://`getent hosts host.docker.internal | awk '{ print $1 }'`:8545
