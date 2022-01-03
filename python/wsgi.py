#!/usr/bin/python3
#
# Copyright 2012 Major Hayden
#
# Licensed under the Apache License, Version 2.0 (the "License"); you may
# not use this file except in compliance with the License. You may obtain
# a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
# WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
# License for the specific language governing permissions and limitations
# under the License.

"""MySQL <-> JSON bridge <-> Ember.js"""

import datetime
import decimal
import json
import logging
import os
import sys
import yaml
import inflect
import pymysql
import threading
import re

from dateutil import parser
from flask import Flask, Response, abort, request, current_app
from functools import wraps, update_wrapper
from urllib.parse import urlparse, urlunparse
from flask_cors import CORS, cross_origin

app = Flask(__name__)
CORS(app)
app.logger.setLevel(logging.INFO)
app.debug = True
dbs = {}

inflection = inflect.engine()
sql_condition = threading.Condition()

# Helps us find non-python files installed by setuptools
def data_file(fname):
    """Return the path to a data file of ours."""
    return os.path.join(os.path.split(__file__)[0], fname)

if not app.debug:
    logyaml = ""
    with open(data_file('config/log.yml'), 'r') as f:
        logyaml = yaml.load(f)
    try:
        formatter = logging.Formatter('%(asctime)s - %(message)s')
        if logyaml['type'] == "file":
            from logging.handlers import RotatingFileHandler
            file_handler = RotatingFileHandler(
                logyaml['logfile'], backupCount=logyaml['backupCount'])
            file_handler.setLevel(logging.INFO)
            file_handler.setFormatter(formatter)
            app.logger.addHandler(file_handler)
        elif logyaml['type'] == 'syslog':
            from logging.handlers import SysLogHandler
            syslog_handler = SysLogHandler()
            syslog_handler.setLevel(logging.INFO)
            syslog_handler.setFormatter(formatter)
            app.logger.addHandler(syslog_handler)
    except:
        pass

def read_config():
    app.logger.debug("entering read_config()")
    databases = {}
    cfiles = []

    cdir = data_file('conf.d/')
    for dirname, dirnames, filenames in os.walk(cdir):
        for filename in filenames:
            fullpath = os.path.join(dirname, filename)
            cfiles.append(fullpath)

    for cfile in cfiles:
        tmp = {}

        if not cfile.endswith('.yaml'):
            continue

        fh = open(data_file(cfile), 'r')
        db = yaml.load(fh)
        fh.close()

        if db is None:
            continue

        if 'identifier' not in db:
            continue

        if 'enabled' not in db:
            continue

        if db['enabled'] != 'True':
            continue

        identifier = db['identifier']

        required = ['scheme', 'username', 'password', 'hostname', 'database']
        if not all(param in db for param in required):
            continue

        scheme = db['scheme']
        netloc = '%s:%s@%s' % (db['username'], db['password'], db['hostname'])
        path = '/%s' % db['database']
        conn = (scheme, netloc, path, None, None, None)
        connection_string = urlunparse(conn)

        tmp[identifier] = connection_string
        databases = dict(databases.items() | tmp.items())
        app.logger.debug("Successfully read configuration files")
    return databases


# Pull the database credentials from our YAML file
def get_db_creds(database):
    databases = read_config()
    mysql_uri = databases.get(database)

    # If the database doesn't exist in the yaml, we're done
    if not mysql_uri:
        return False

    # Parse the URL in the .yml file
    try:
        o = urlparse(mysql_uri)
        creds = {
            'host':   o.hostname,
            'db':     o.path[1:],
            'user':   o.username,
            'passwd': o.password,
        }
    except:
        creds = False

    return creds


def setup_db_connection(database):
    if database in dbs.keys():
        db = dbs[database]
        if db.open:
            app.logger.debug(
              "Using existing database connection to " + database)
            return db

    creds = get_db_creds(database)

    # If we couldn't find corresponding credentials, throw a 404
    assert creds, "Unable to find credentials for " + database

    # Prepare the database connection
    app.logger.debug("Connecting to %s database (%s)" % (
        database, request.remote_addr))
    db = pymysql.connect(**creds)
    db.autocommit(True)

    dbs[database] = db
    # return the database object
    return db


def execute_sql(cursor, database, sql, vars):
    # Attempt to run the query
    app.logger.info("%s attempting to run \"%s\" against %s database with tuple %s" % (
        request.remote_addr, sql, database, vars))
    try:
        sql_condition.acquire()
        cursor.execute(sql, vars)
        data = cursor.fetchall()
        sql_condition.release()
        app.logger.info("returning " + str(len(data)) + " results")
        app.logger.debug("results: " + str(data))
        return data

    except pymysql.err.MySQLError as e:
        app.logger.error("ERROR" +  str(e.args) + " When running " + sql)
            abort(500)
    except Exception as e:
        app.logger.error("query failed: " + str(e))


# This handles slotting entries
@app.route("/<competition>/slotEventEntries", methods=['POST'])
def do_ember_table(database=None, table=None):
    db = None
    try:
        db = setup_db_connection(database)

    except pymysql.err.MySQLError as e:
        app.logger.error("Failed to setup database connection: " + str(e) )
        abort(404)

        sql = "SELECT * from `" + table_singular + "`;"
        results = execute_sql(cursor, database, sql, ())
        return {table : results}
    else:
        abort(404)

# Reset entry slotting
@app.route("/<compeition>/resetEventEntries", methods=['POST'])
def do_json_table_post(database=None, table=None):
    db        = None
    data      = None
    json_data = None

    app.logger.info("Got POST to " + database + " table " + table + " of " + str(request.json))
    db = setup_db_connection(database)

    table_singular = inflection.singular_noun(table)
    cursor = db.cursor(pymysql.cursors.DictCursor)

    (s, vars) = make_name_value_list_string(request.json[table_singular].items())

    sql = "INSERT INTO `" + table_singular + \
          "` SET " + s + ";"
    try:
        results = execute_sql(cursor, database, sql, vars)

        sql = "SELECT LAST_INSERT_ID();"
        results = execute_sql(cursor, database, sql, ())

        id = str(results[0]['LAST_INSERT_ID()'])

        sql = "SELECT * FROM `" + table_singular + "` WHERE id = %s;"
        results = execute_sql(cursor, database, sql, (id,))
        result = results[0]
        data = {table: result}
        json_data = json.dumps(data, default=json_fixup)
        app.logger.info("json data: " + str(json_data))

    except pymysql.err.MySQLError as e:
        app.logger.error(str(e))
        raise e

    finally:
        if json_data is not None:
            return Response(json_data, status=201, mimetype='application/json')
        else:
            abort(500)

@app.route("/<competition>/getScoreSheet", methods=['GET'])
def do_json_get_table_entry(database=None, table=None, id=None):
    db   = None
    data = None
    try:
        db = setup_db_connection(database)

        table_singular = inflection.singular_noun(table)
        cursor = db.cursor(pymysql.cursors.DictCursor)

        sql = "SELECT * from `" + table_singular + \
              "` WHERE `id`=%s;"

        results = execute_sql(cursor, database, sql, (id,))
        result = results[0]
        data = {table : result}

        if request.args.get('include') is not None:
            include_singular = request.args.get('include')
            include = inflection.plural(include_singular)

            sql = "SELECT * from `" + include_singular + \
                "` WHERE `" + table_singular + "`= %s;"
            include_results = execute_sql(cursor, database, sql, (id,))

            include_indexs = []
            for x in include_results:
                include_indexs.append(x['id'])

            app.logger.debug("include_indexs: " + str(include_indexs))

            result.update({include : include_indexs})
            data = {table : [result], include : include_results}

    except pymysql.err.MySQLError as e:
        app.logger.error("MySQLError: " + str(e))
        abort(404)
    finally:
        return data

@app.route("/labels/", methods=['GET'])
def do_json_put_table_entry(database=None, table=None, id=None):
    app.logger.info("Got PUT to " + database + ", table " + table + ", id " + id + " of " + str(request.json))

    db = setup_db_connection(database)

    table_singular = inflection.singular_noun(table)
    cursor = db.cursor(pymysql.cursors.DictCursor)

    app.logger.debug("json: " + str(request.json[table_singular].items()))
    (s, vars) = make_name_value_list_string(request.json[table_singular].items())

    sql = "UPDATE `" + table_singular + \
          "` SET " + \
          s + \
          " WHERE `id`= %s;"
    results = execute_sql(cursor, database, sql, vars + (id,))
    return Response("", status=200)


@app.route("/<competition>/certificate/<id>", methods=['GET'])
def do_json_put_table_entry(database=None, table=None, id=None):
    app.logger.info("Got PUT to " + database + ", table " + table + ", id " + id + " of " + str(request.json))

    db = setup_db_connection(database)

    table_singular = inflection.singular_noun(table)
    cursor = db.cursor(pymysql.cursors.DictCursor)

    app.logger.debug("json: " + str(request.json[table_singular].items()))
    (s, vars) = make_name_value_list_string(request.json[table_singular].items())

    sql = "UPDATE `" + table_singular + \
          "` SET " + \
          s + \
          " WHERE `id`= %s;"
    results = execute_sql(cursor, database, sql, vars + (id,))
    return Response("", status=200)

if __name__ == "__main__":
    app.run(host='0.0.0.0', threaded=True)
