#!/bin/bash
docker build -t screen-translate .
docker create --name temp screen-translate
docker cp temp:/var/task/node_modules ./node_modules
docker rm temp 