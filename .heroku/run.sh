#!/bin/bash
#
# Run at buildpack time.
# https://github.com/niteoweb/heroku-buildpack-shell.git

# Install rclone
# https://rclone.org/install/#script-installation
curl -O https://downloads.rclone.org/rclone-current-linux-amd64.zip
unzip rclone-current-linux-amd64.zip
mkdir -p bin
cp rclone-*-linux-amd64/rclone bin
