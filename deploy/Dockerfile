FROM ethereum/client-go as builder

#RUN echo "http://mirrors.aliyun.com/alpine/v3.4/main/" > /etc/apk/repositories 
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.tuna.tsinghua.edu.cn/g' /etc/apk/repositories

RUN apk add --no-cache nodejs nodejs-npm

#RUN cd ~ && npm config -g set registry http://npm.tuna.tsinghua.edu.cn/registry  && npm -g init -y

RUN apk add --no-cache python git vim g++ make bash openssh

RUN cd ~ && npm config set registry http://registry.npm.taobao.org && npm init -y
#RUN cd ~ && npm config set registry https://npm.taobao.org/mirrors/npm/ && npm init -y

RUN cd ~ && npm install web3@0.20.7

RUN cd ~ && npm install keythereum ethereumjs-util ethereumjs-tx@1.3.7 sleep

COPY ./ /root/

EXPOSE 8545
EXPOSE 30303

#ENTRYPOINT ["bash"]
ENTRYPOINT ["/root/launchChain.sh"]

