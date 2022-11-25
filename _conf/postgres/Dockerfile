FROM postgres:14

# Install wal2json extension
RUN apt-get update
RUN apt-get install -y postgresql-14-wal2json

# Set wal_level to logical
# RUN postgres -c wal_level=logical
