#!/bin/bash
#
# Run at buildpack time.
# https://github.com/niteoweb/heroku-buildpack-shell.git

# Install rclone
# https://rclone.org/install/#script-installation
curl -O https://downloads.rclone.org/rclone-current-linux-amd64.zip
unzip rclone-current-linux-amd64.zip
mkdir -p shellbin
cp rclone-*-linux-amd64/rclone shellbin

# Put rclone on the path
# https://blog.heroku.com/hacking-buildpacks#modifying-the-path
echo "---"
echo "config_vars:"
echo "  PATH: $PATH:$PWD/shellbin"
