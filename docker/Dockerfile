#Docker Image for Open Comment Box

FROM ubuntu
MAINTAINER Arunoda Susiripala, arunoda.susiripala@gmail.com

RUN echo deb http://archive.ubuntu.com/ubuntu precise universe >> /etc/apt/sources.list
RUN apt-get update -y

#install dependencies
RUN apt-get -y install build-essential libssl-dev wget

#configuration for node
ENV NODE_VERSION 0.10.21
ENV NODE_ARCH x64

#installation node
WORKDIR /tmp
RUN wget http://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-$NODE_ARCH.tar.gz
RUN tar xvzf node-v$NODE_VERSION-linux-$NODE_ARCH.tar.gz
RUN rm -rf /opt/nodejs
RUN mv node-v$NODE_VERSION-linux-$NODE_ARCH /opt/nodejs

RUN ln -sf /opt/nodejs/bin/node /usr/bin/node
RUN ln -sf /opt/nodejs/bin/npm /usr/bin/npm

#install mongodb
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
RUN echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' | tee /etc/apt/sources.list.d/10gen.list
RUN apt-get update -y
RUN apt-get install mongodb-10gen=2.4.5

#initialize system
RUN mkdir -p /opt/ocb
WORKDIR /opt/ocb

RUN npm install -g node-gyp

#downloading app
RUN wget --no-check-certificate https://github.com/arunoda/open-comment-box/archive/v0.2.0.tar.gz
RUN tar xvzf v0.2.0.tar.gz
RUN mv open-comment-box-0.2.0 app
RUN cd app && npm install

#db setup
RUN mkdir -p /data/db

#copy running scripts
ADD start.sh /opt/ocb/start.sh
ENTRYPOINT ["bash", "start.sh"]
