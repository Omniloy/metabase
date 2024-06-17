(ns metabase.test.data.databricks-jdbc
  (:require
   [clojure.java.jdbc :as jdbc]
   [java-time.api :as t]
   [metabase.driver.ddl.interface :as ddl.i]
   [metabase.driver.sql-jdbc.connection :as sql-jdbc.conn]
   [metabase.driver.sql-jdbc.execute :as sql-jdbc.execute]
   [metabase.test.data.interface :as tx]
   [metabase.test.data.sql :as sql.tx]
   [metabase.test.data.sql-jdbc :as sql-jdbc.tx]
   [metabase.test.data.sql-jdbc.execute :as execute]
   [metabase.test.data.sql-jdbc.load-data :as load-data]
   [metabase.test.data.sql.ddl :as ddl]
   [metabase.util :as u]
   [metabase.util.log :as log])
  (:import (java.time Instant LocalDate LocalDateTime OffsetDateTime ZonedDateTime)))

(set! *warn-on-reflection* true)

(sql-jdbc.tx/add-test-extensions! :databricks-jdbc)

(doseq [[base-type database-type] {:type/BigInteger             "BIGINT"
                                   :type/Boolean                "BOOLEAN"
                                   :type/Date                   "DATE"
                                   :type/DateTime               "TIMESTAMP"
                                   :type/DateTimeWithTZ         "TIMESTAMP"
                                   :type/DateTimeWithZoneOffset "TIMESTAMP"
                                   :type/Decimal                "DECIMAL"
                                   :type/Float                  "DOUBLE"
                                   :type/Integer                "INTEGER"
                                   :type/Text                   "STRING"
                                   #_#_:type/TimeWithTZ             "TIMESTAMP"}]
  (defmethod sql.tx/field-base-type->sql-type [:databricks-jdbc base-type] [_ _] database-type))

(defmethod tx/dbdef->connection-details :databricks-jdbc
  [_driver _connection-type {:keys [database-name]}]
  (merge
   {:host      (tx/db-test-env-var-or-throw :databricks-jdbc :host)
    :token     (tx/db-test-env-var-or-throw :databricks-jdbc :token)
    :http-path (tx/db-test-env-var-or-throw :databricks-jdbc :http-path)
    :catalog   (tx/db-test-env-var-or-throw :databricks-jdbc :catalog)
    :schema    database-name}))

(defn- existing-databases
  "Set of databases that already exist. Used to avoid creating those"
  []
  (sql-jdbc.execute/do-with-connection-with-options
   :databricks-jdbc
   (->> (tx/dbdef->connection-details :databricks-jdbc nil nil)
        (sql-jdbc.conn/connection-details->spec :databricks-jdbc))
   nil
   (fn [^java.sql.Connection conn]
     (into #{} (map :databasename) (jdbc/query {:connection conn} ["SHOW DATABASES;"])))))

(def ^:private ^:dynamic *allow-database-creation*
  "Same approach is used in Databricks driver as in Athena. Dataset creation is disabled by default. Datasets are
  preloaded in Databricks instance that tests run against. If you need to create new database on the instance,
  run your test with this var bound to true."
  #_true false)

(defmethod tx/create-db! :athena
  [driver {:keys [schema], :as db-def} & options]
  (let [schema (ddl.i/format-name driver schema)]
    (cond

      (contains? #_#{} (existing-databases) schema)
      (log/infof "Databricks database %s already exists, skipping creation" (pr-str schema))

      (not *allow-database-creation*)
      (log/fatalf (str "Athena database creation is disabled: not creating database %s. Tests will likely fail.\n"
                       "See metabase.test.data.athena/*allow-database-creation* for more info.")
                  (pr-str schema))

      :else
      (do
        (log/infof "Creating Databricks database %s" (pr-str schema))
        (apply (get-method tx/create-db! :sql-jdbc/test-extensions) driver db-def options)))))

;; Following implementation does not attemp to .setAutoCommit, that is not supported by Databricks jdbc driver.
(defmethod load-data/do-insert! :databricks-jdbc
  [driver spec table-identifier row-or-rows]
  (let [statements (ddl/insert-rows-ddl-statements driver table-identifier row-or-rows)]
    (sql-jdbc.execute/do-with-connection-with-options
     driver
     spec
     {:write? true}
     (fn [^java.sql.Connection conn]
       (try
         (doseq [sql+args statements]
           (jdbc/execute! {:connection conn} sql+args {:transaction? false}))
         (catch java.sql.SQLException e
                (log/infof "Error inserting data: %s" (u/pprint-to-str 'red statements))
                (jdbc/print-sql-exception-chain e)
                (throw e)))))))

(defmethod load-data/load-data! :databricks-jdbc
  [& args]
  (apply load-data/load-data-and-add-ids! args))

(defmethod execute/execute-sql! :databricks-jdbc [& args]
  (apply execute/sequentially-execute-sql! args))

(defmethod sql.tx/pk-sql-type :databricks-jdbc [_] "INT")

(defmethod tx/supports-time-type? :databricks-jdbc [_driver] false)
(defmethod tx/supports-timestamptz-type? :databricks-jdbc [_driver] false)

;; Following is necessary!
(defmethod sql.tx/drop-db-if-exists-sql :databricks-jdbc
  [driver {:keys [database-name]}]
  (format "DROP DATABASE IF EXISTS %s CASCADE" (sql.tx/qualify-and-quote driver database-name)))

;; Databrickks supports only java.sql.Timestamp and Date as prepared statement parameters. java.time.* types values
;; used to fill the test databases are updated according to that in the following method implementation.
;;
;; At the time of writing, `jdbc/execute` is used for insert statments execution. We define handling for java.time.*
;; classes by `jdbc/execute` in [[metabase.db.jdbc-protocols]] by extension of `clojure.java.jdbc/ISQLParameter`. That
;; is not compatible with Databricks.
;;
;; Alternatively, `->honeysql` could be implemented for values of classes in question. I'm not sure if that wouldn't
;; somehow break something else -- having java.sql* class values in compiled honeysql. As this problem surfaced only
;; during test dataset creation, I'm leaving solution solely test extensions based.
(defmethod ddl/insert-rows-honeysql-form :databricks-jdbc
  [driver table-identifier row-or-rows]
  (let [rows (u/one-or-many row-or-rows)
        rows (for [row rows]
               (update-vals row
                            (fn [val]
                              (cond
                                (or (instance? OffsetDateTime val)
                                    (instance? ZonedDateTime val)
                                    (instance? LocalDateTime val))
                                (t/sql-timestamp val)

                                (instance? Instant val)
                                (t/instant->sql-timestamp val)

                                (instance? LocalDate val)
                                (t/sql-date val)

                                :else
                                val))))]
    ((get-method ddl/insert-rows-honeysql-form :sql/test-extensions) driver table-identifier rows)))
