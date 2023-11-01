
#Download Tableau Bridge rpm

curl -OL https://downloads.tableau.com/tssoftware/TableauBridge-20233.23.1017.0948.x86_64.rpm

#Download database drivers for mysql and postgres
curl -OL https://dev.mysql.com/get/mysql80-community-release-el7-7.noarch.rpm
curl -OL https://jdbc.postgresql.org/download/postgresql-42.3.4.jar

# allow rpm files to be executed
chmod +x *.rpm
chmod +x *.sh
