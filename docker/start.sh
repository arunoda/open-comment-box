#!/bin/bash

if [[ "$MONGO_URL" != "" ]]; then
  echo "Using MONGO_URL";

  cd app
  NODE_ENV=production node server.js
else
  echo "Using local mongodb server(not recommended)"
  
  mongod &
  cd app
  NODE_ENV=production node server.js
fi