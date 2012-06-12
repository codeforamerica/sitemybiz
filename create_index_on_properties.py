import pymongo
from pymongo import Connection, GEO2D

connection = Connection('localhost')
db = connection['sitemybiz']

for property in db.properties.find():
    property['loc'] = [ property['long'] , property['lat'] ]
    db.properties.save(property)
    
db.properties.ensure_index([('loc', GEO2D)])