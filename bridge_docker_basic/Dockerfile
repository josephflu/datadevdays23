FROM centos:7
RUN yum -y update
WORKDIR /
COPY mysql80-community-release-el7-7.noarch.rpm .
RUN yum install -y mysql80-community-release-el7-7.noarch.rpm
COPY postgresql-42.3.4.jar /opt/tableau/tableau_driver/jdbc/
COPY TableauBridge-20233.23.1017.0948.x86_64.rpm .
ENV ACCEPT_EULA=y
RUN yum install -y TableauBridge-20233.23.1017.0948.x86_64.rpm
RUN rm *.rpm
COPY start-bridgeclient.sh .
CMD ["./start-bridgeclient.sh"]
