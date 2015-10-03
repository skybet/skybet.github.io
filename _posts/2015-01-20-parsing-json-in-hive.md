---
layout:     post
title:      SerDe vs UDF – parsing JSON in Hive
permalink:  parsing-json-in-hive
date:       2015-01-20 14:10:00
summary:    5 different approaches to handling JSON data with Hive.
---

In the Sky Betting and Gaming data team we were recently asked to keep records of business events that are of interest to our analysts in our Hive data warehouse. These events are delivered in files containing JSON structures (1 JSON object per event). JSON's simplicity and ubiquitous nature has made it the weapon of choice for data interchange in recent times and this means that, as a Hive developer, it’s likely that you are going to encounter JSON format data at some point. Hive provides two main mechanisms for dealing with this, JSON UDFs (of which there are two) and JSON SerDes (of which there are many but they all do a similar thing). The below outlines 5 different approaches and provides a guide as to the situations in which each is optimal.

### 1. Store the JSON directly and parse it at query time

We start with the simplest possible approach: we do nothing. As mentioned above Hive has the ability to parse JSON at query time via UDFs so why not store the JSON in a simple string column and parse it as necessary?

    SELECT get_json_object(business_events_raw.json,$.event_date) event_date,
      get_json_object(business_events_raw.json,$.event_Type) event_type


In the above example the business_events_raw table contains a single column named json that contains the JSON structures. From these we use the UDF to pull out the `event_date` and `event_type` properties.

The disadvantage to this approach is pretty obvious, Hive will need to parse the JSON for every query resulting in an often unnecessary overhead. However, the key advantage to this approach is perhaps less obvious. Because the JSON structure is defined at query time you can have great variety in your JSON structures and still be able to query effectively. The other approaches mentioned here create columns for JSON fields and so are tightly coupled to a schema. Parsing at query time however is much more flexible as you can modify the query to fit the new schema and attempting to parse a field that doesn’t exist in the JSON at query time will just return null.

### 2. Use the get_json_object UDF when unstaging

Let’s say that performance is a primary concern and that we have a well-defined JSON structure that is unlikely to change. In this case the query time parsing approach is very inefficient but but we can still use the UDFs at the point of data insertion to create Hive columns from JSON fields. In particular the `get_json_object` UDF is designed to parse a JSON string and return fields. It takes two arguments, a column containing the raw JSON string and an argument detailing the field to be selected (dot notation where `$` is the root).
At SB&G, we have a best practice to stage all raw data that is ingested into the data warehouse before unstaging it into more useful table structures. In this case the raw JSON is staged into a table in string format and then unstaged using the get_json_object UDF into a destination table. The example for this is very similar to the query above except that it inserts the results into a separate table rather than displaying them to the user. This means this query only need be run once and subsequent selects can be done from the destination table:

    INSERT INTO TABLE destination_table
      SELECT get_json_object(business_events_raw.json,$.event_date) event_date,
             get_json_object(business_events_raw.json,$.event_type) event_type

The resulting table contains columns representing individual fields within the JSON and can be queried in the usual way.

The advantage of this approach is that the JSON is only parsed during unstaging. This results in much faster queries on the destination table as the query is reading conventional column values rather than JSON structures. It is also worth noting the power of the notation used in the second argument of `get_json_object`. Even very complex nested JSON objects can be queried in this way.

However, from a performance perspective this approach is still not optimal. For each call to the `get_json_object` UDF the JSON is parsed meaning that in situations where the same JSON is used repeatedly to fill multiple columns it will be parsed more than once. For instance, in the example above the JSON will be parsed for event_date and for event_type where it need only be parsed once.

### 3. Use the `json_tuple` UDF when unstaging

Hive provides a solution to the get_json_object parsing issue in the other JSON related UDF, json_tuple. The json_tuple UDF is designed to be combined with LATERAL VIEW to parse a JSON structure only once and emit one or more columns. The syntax for this looks like the below:

    INSERT INTO TABLE destination_table
      SELECT LATERAL VIEW json_tuple(business_events_raw.json, ‘event_type’, ‘event_date’)
      as event_type, event_date

In this case the JSON structure is parsed only once, however the two JSON fields (`event_type` and `event_date`) are assigned to two columns (`event_type` and `event_date`).
You may have noticed that this does not use the same notation as `get_json_object`. This is because this function can only be applied to simple key, value lists and can’t be used with nested JSON structures. Unfortunately, whilst this can potentially give much better performance than `get_json_object` this restriction makes it impractical for most applications.

### 4. Use a JSON Serde

The final method of JSON parsing within Hive described here is to use a SerDe. SerDe is short for serializer/deserializer and they control conversion of data formats between HDFS and Hive. Using a SerDe data can be stored in JSON format in HDFS and be automatically parsed for use in Hive. A SerDe is defined in the `CREATE TABLE` statement and must include the schema for the JSON structures to be used. The example used in the previous sections would look like:

    CREATE TABLE business_events (
      event_type string,
      event_date string
    ) ROW FORMAT SERDE ‘org.openx.data.jsonserde.JsonSerDe’

Nested fields can easily be added too:

    CREATE TABLE business_events (
      event_type string,
      event_date string,
      user struct <first_name : string,
                   last_name : string>
    ) ROW FORMAT SERDE ‘org.openx.data.jsonserde.JsonSerDe’

Once the table has been created data can be added in the usual way and queried using the JSON field names, nested fields can be queried using dot notation as below:

    SELECT event_date, event_type, user.first_name, user.last_name
      FROM json_serde

The main advantage of using a SerDe is the ease of use. Once the table has been set up, the data conversion happens in the background and users of that data need not worry about the mechanics behind it. This can be very important if speed of ingest is a primary concern and so the overhead that goes with the staging and unstaging process described above is impractical. It is also worth noting that some SerDes can contain extensive optimization that makes them highly efficient at data conversion.

However, it is the data conversion that raises the main disadvantage with using a SerDe for JSON. Because the SerDe defines the data format on the file system you cannot use optimized storage formats such as ORC files and Parquet. It has already been shown that these can have an enormous effect on performance when the query pattern is known for the data and so losing that ability is a major blow.

### A Hybrid of solutions 1 and 2

It is often the case (particularly with things like log/business events) stored in JSON that certain fields of the JSON structure are regularly queried against but others are not. To keep with the business event example your structure may look something like this:

    { "event_type": "login",
      "event_date": "2014-12-01 00:00:00",
      "session_id": "12345678" }

Here we would be very likely to query by `event_type` and `event_date` but unlikely to want the `session_id` regularly.

In this situation we can use approach 2 to extract `event_type` and `event_date` into our destination table, but also add a column that holds the original JSON. This destination table would look something like this:

    |event_type|event_date         |json                 |
    |----------|-------------------|---------------------|
    |login     |2014-12-01 00:00:00|{ ... full json ... }|

Because we still have the JSON captured in our table, we can use Approach 1 to query the session_id from that JSON column. This gives a nice middle ground between the performance of approach 2 and the flexibility of approach 1.

### Conclusion

The five approaches outlined above are by no means exhaustive but are intended to show the basic considerations you should have when using JSON in Hive. It is worth noting that, due to Hive’s open source and pluggable nature, there are many customizations available for each approach that may get round some of the issues raised here and be more suitable for your particular problem.

The general rules for approach selection are:

* If your JSON schema is not clearly defined you should use approach 1 and parse at query time.
* When you have a clearly defined but complex JSON structure you should use either the SerDe or a UDF in a stage/unstage process. The choice between these two really depends on the ingest requirements (for high speed ingest use the SerDe) and querying patterns (for a defined query pattern that could be optimized using HDFS file formats then use the UDF).
* When your JSON structure simple key/value and you are using UDFs to parse it, favour json_tuple over get_json_object.

For our specific problem described in the second paragraph we found that the data structures we would be parsing were clearly defined and simple key/value structures. We also found that there was a defined query behavior whose optimization should be given precedence over ingest speed. For these reasons we chose to use the json_tuple UDF combined with a stage/unstage process.

As Cloudera users we may have to revisit this issue at SB&G in the near future thanks to items on the Impala roadmap. 2015 promises enhanced query features for nested structures and enhancements to the parquet storage format that almost certainly will invite some new approaches to this problem.

I hope this sheds some light on some of the concerns surrounding the use of JSON in Hive, as always we appreciate your comments and feedback.
