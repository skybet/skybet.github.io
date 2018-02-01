---
layout:     post
title:      Google Phone Numbers in Spark
author:
- alice_kaerast
- darrell_taylor
date:       2016-03-30 11:00:00
summary:    Our CRM team rely on having clean phone numbers to push SMS messages to customers, various people have tried creating some logic for this validation but surely this is a solved problem.
category:   Data
tags:       Data, Spark
---

### The Problem

Our CRM team have always relied on having a cleaned up phone number from our old datawarehouse so that they can push SMS messages to customers.  The old system was something of a black box in the way it cleaned and validated phone numbers, and various people across the business have attempted to come up with an alternative.  We operate across multiple countries, so any SQL code to validate phone numbers ends up being either very naive or very hard to read or both.

A first attempt at cleaning up these phone numbers included many levels of nested IF statements in SQL, the following being just a tiny segment.

```sql
if(substr(c.telephone,1,5) in ('+3505','+3538','+3584','+3585'),
        --then
        regexp_replace(c.telephone,'\\+',''),
        --else
        if(substr(c.telephone,1,4) = '+447',
        --then
        regexp_replace(c.telephone,'\\+',''),
        --else
        if(substr(c.telephone,1,2) = '07' and c.country_code='UK',
            --then
            concat('44',regexp_replace(c.telephone,'^0','')),
            --else
            if(substr(c.telephone,1,3) = '058' and c.country_code='GI',
            --then
            concat('350',regexp_replace(c.telephone,'^0','')),
            --else
            if(substr(c.telephone,1,2) = '08' and c.country_code='IE',
                --then
                concat('353',regexp_replace(c.telephone,'^0','')),
                --else
                if(substr(c.telephone,1,2) in ('05','04') and c.country_code='FI',
                --then
                concat('358',regexp_replace(c.telephone,'^0','')),
                --else
                c.mobile
                )
            )
            )
        )
        )
    )
```

Surely there must be a better way? Somebody must have solved this problem already?

Thanks Google!  Their phone number library [libphonenumber](https://github.com/googlei18n/libphonenumber) for parsing, formatting and validating international phone numbers has been in use in Android since 4.0.  It's written in Java though, and we wanted to try something out quickly.  Fortunately there's a [Python wrapper](https://github.com/daviddrysdale/python-phonenumbers) to make usage much easier.

### Proof of concept

```
darrell@darrell-hadoop python (dev) $ python
Python 2.7.6 (default, Jun 22 2015, 17:58:13)
[GCC 4.8.2] on linux2
Type "help", "copyright", "credits" or "license" for more information.
>>> import phonenumbers
>>> p = phonenumbers.parse('07700900016', 'GB')
>>> p
PhoneNumber(country_code=44,
            national_number=7700900016,
            extension=None,
            italian_leading_zero=None,
            number_of_leading_zeros=None,
            country_code_source=None,
            preferred_domestic_carrier_code=None)
>>> phonenumbers.is_valid_number(p)
True
```

### Process for all customers

After a few minutes we can see that libphonenumber is easy to work with, and correctly identifies some numbers we've put into it (side note, Italian numbers are weird).  But how can we apply this to all of our customers in a simple and performant manner?  Traditionally we'd use a Hive UDF for this kind of functionality, but they're a bit awkward to maintain and we've had problems in migrating UDFs from Hive to Impala in the past.  We also have a more modern framework in the form of PySpark so lets get the cluster to do all the work.

### Proof of Concept - part 2

Lets load the relevant fields from a small subset of data into a Spark dataframe using SparkSQL and work on them there.

```python
#
# Cleanup phone numbers
#
#
from pyspark import SparkContext
# sc is an existing SparkContext.
from pyspark.sql import *
from pyspark.sql.types import *
import phonenumbers
from phonenumbers import PhoneNumberType
from datetime import datetime

sc = SparkContext(appName="CleanPhoneNumbers")

sqlContext = HiveContext(sc)
sqlContext.setConf("spark.sql.hive.convertMetastoreParquet", "false")
dfCustomers = sqlContext.sql("""SELECT \
                                cust_id,\
                                telephone,\
                                mobile,\
                                country_code, \
                                email, \
                                dw_last_modified_dt \
                                FROM \
                                sbgi_customers.customers_detail\
                                """)

dfCustomers = (
    dfCustomers
    .filter(dfCustomers.dw_last_modified_dt >= '2016-03-21 00:00:00')
)

def fixrecord(c):
    # Prefer the mobile field over the telephone field
    number = c.telephone if c.mobile is None else c.mobile

    # Our country code definitions don't match up with Google's so fix the UK ones
    if c.country_code == 'UK':
        country_code = 'GB'
    else:
        country_code = c.country_code

    is_valid_number = "N"
    clean_number = None
    number_type = None

    p = None

    if number is not None:
        # Clean the number first
        try:
            p = phonenumbers.parse(number, country_code)

            if phonenumbers.is_valid_number(p):
                is_valid_number = "Y"
            elif phonenumbers.truncate_too_long_number(p):
                is_valid_number = "Y"
            else:
                is_valid_number = "N"

            clean_number = "%s%s" % (p.country_code, p.national_number)
        except:
            p = None

    return Row(
        # These are listed in alphabetical order as this is the way they
        # come out when the data frame is created
        clean_number=clean_number,
        cust_id=c.cust_id,
        is_valid_number=is_valid_number
    )

rddCustomers = dfCustomers.map(lambda c: fixrecord(c))

schema = StructType([
    StructField("clean_number",    StringType(),    True),
    StructField("cust_id",         LongType(),      True),
    StructField("is_valid_number", StringType(),    True)
])

df = SQLContext(sc).createDataFrame(rddCustomers, schema)
df.write.parquet(
    '/user/taylord/test/clean_numbers/', mode='overwrite')
```

To run this code in the cluster is simple, we just need to pass in the library along with the code we've just written to spark-submit.

```bash
spark-submit --py-files phonenumbers.zip clean_phone_numbers.py
```

That's all

### Results

So how does this compare to the old way of doing things?  Well the numbers are not insignificant, and our CRM team could give you some numbers around this.

Out of a customer base of millions just for the UK and Ireland, libphonenumber marks hundreds of thousands of records as valid that were previously invalid.

We now need to understand why the big difference.  The previous system had some bugs around Irish mobile numbers, but there's also a sizeable number of cases where the phone number doesn't match the customer's country.  In one instance, a Dubai phone number, the old system naively tried to add +44 to the number which meant it created a phone number it then decided was invalid; libphonenumber instead correctly identified the country and handled it accordingly.

### Phone number type

Libphonenumber can identify phone number types much better than our old system.  Of most interest to us is being able to identify Fixed line, Mobile, Personal number, Pager and Premium Rate numbers.

We discovered that about 25% of the valid phone numbers were landline numbers, 74% mobile numbers.  There's also a small number of pagers as well as VoIP numbers, toll free numbers and premium rate numbers.

### Can receive SMS?

Going back to the original requirement, our CRM team want to use this data to send SMS messages to customers.  Lets help them make the decision on which number type they can use.

```python
is_mobile = (number_type == PhoneNumberType.MOBILE or
			 number_type == PhoneNumberType.FIXED_LINE_OR_MOBILE or
				 number_type == PhoneNumberType.PAGER)
if (is_valid_number=='Y' and is_mobile):
	can_rx_sms = 'Y'
```

### Manage spark partitions

This is now coming together nicely, but when we try running it across our entire customer base it takes over an hour.  That can't be right, so what's happening?  The HiveContext we're using to read data into an RDD uses a single partition, meaning a single Yarn container to do all of the work.  We should probably repartition the data to speed this up.

```python
#
# Work out the number of partitions we need based on 150K customers per executor
# seems to be a fair trade off for processing speed.  If this partition stage is
# skipped the process takes over an hour.
#
NumberOfCustomers = dfCustomers.count()
NumberOfPartitions = max(NumberOfCustomers / 150000, 1)
rddCustomers = (
    dfCustomers
    .repartition(NumberOfPartitions)
    .map(lambda c: fixrecord(c))
    )
```

By dynamically repartitioning the data to paritions of up to 150,000 records we managed to speed this up to just a few minutes across the entire customer base.

Whilst it's great that we can run this across our entire customer base in just a few minutes, we don't really want to be doing that.  First of all it's wasted work, but more importantly we need to know about customer contact details as soon as they change - not a day later.  So rather than run this against the customers table, we run it against newly created or modified customer records every thirty minutes.

### Lessons learned

- Using regular Python modules in PySpark is easy, just submit a .zip with the job
- PoC to production is really quick, particularly now we've extended our [Pidl](https://github.com/skybet/pidl) code to support Spark
