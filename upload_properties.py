import pymongo, os
from pymongo import Connection

connection_local = Connection('localhost')
db_local = connection_local['commercialspacein_santacruz']

connection_remote = Connection('mongodb://ruthie:changeme@flame.mongohq.com:27061/sitemybiz')
db_remote = connection_remote['sitemybiz']

properties = db_local.properties.find()

for prop in properties:
    try:
        db_remote.properties.save(prop)
    except Exception as e:
        print "exception: {0}".format(e)

#    print "saving available parcel {0}".format(available_parcel['properties']['APN'])
#    db_local.available_parcels.save(available_parcel)
#    db_remote.available_parcels.save(available_parcel)