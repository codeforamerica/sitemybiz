import pymongo, os
from pymongo import Connection

connection_local = Connection('localhost')
db_local = connection_local['commercialspacein_santacruz']

connection_remote = Connection('mongodb://ruthie:changeme@flame.mongohq.com:27061/sitemybiz')
db_remote = connection_remote['sitemybiz']

available_parcels = []
parcels = db_local.parcels.find()

for parcel in parcels:
    try:
        coordinates = parcel['geometry']['coordinates']
        properties = db_local.properties.find({ 'loc' : { '$within' : { '$polygon' : coordinates[0] } } })
        if properties.count() > 0:
            for prop in properties:
                # -- Add property data to parcel --

                parcel['properties']['property_id'] = prop['OBJECTID']              # 3824

                # location
                parcel['properties']['property_lat'] = prop['lat']                  # 36.9605641
                parcel['properties']['property_lng'] = prop['long']                 # -122.0442319
                parcel['properties']['property_address_full'] = prop['ADDRESS']
                parcel['properties']['property_address_raw'] = prop['Add_']         # "831 ALMAR AVE"
                parcel['properties']['property_address_street'] = prop['ADDRESS 1'] # "831 Almar Avenue"
                parcel['properties']['property_address_city'] = prop['ADDRESS 2']   # "Santa Cruz"
                parcel['properties']['property_address_state'] = prop['ADDRESS 3']  # "CA"
                parcel['properties']['property_address_zip'] = prop['ADDRESS 4']    # 95060
                parcel['properties']['property_neighborhood'] = prop['Neighborho']  # "Westside"

                # rent
                parcel['properties']['property_gross'] = prop['GROSS']
                parcel['properties']['property_nnn'] = prop['NNN']

                # zoning and use
                parcel['properties']['property_zoning_1_full'] = prop['ZONING_1_FULL'] # "General Industrial Perf 2"
                parcel['properties']['property_zoning_1_code'] = prop['ZONING_1_CODE'] # "IGP2"
                parcel['properties']['property_zoning_2_full'] = prop['ZONING_2_FULL'] # ""
                parcel['properties']['property_zoning_2_code'] = prop['ZONING_2_CODE'] # ""
                parcel['properties']['property_zoning_3_full'] = prop['ZONING_3_FULL'] # ""
                parcel['properties']['property_zoning_3_code'] = prop['ZONING_3_CODE'] # ""
                parcel['properties']['property_use_type_simple'] = prop['Simplified']  # "Commercial/Industrial"
                parcel['properties']['property_use_type'] = prop['TYPE']               # "Industrial"

                # square footage
                parcel['properties']['property_footage'] = prop['SQFEET']              # 44825
                parcel['properties']['property_footage_range'] = prop['SQFTRange']     # "25000-50000"

                # dates
                parcel['properties']['property_listed'] = prop['LISTED']               # "4/1/11"
                parcel['properties']['property_available'] = prop['AVAILABLE']         # "6/1/11"
                parcel['properties']['property_year'] = prop['YEAR']                   # 2011

                # Add parcel data
                available_parcels.append(parcel)
                print "available_parcels count is {0}".format(len(available_parcels))
    except Exception as e:
        print "exception: {0}".format(e)
    
print "total available_parcels to save: {0}".format(len(available_parcels))

for available_parcel in available_parcels:
   print "saving available parcel {0}".format(available_parcel['properties']['APN'])
   db_local.available_parcels.save(available_parcel)
   db_remote.available_parcels.save(available_parcel)