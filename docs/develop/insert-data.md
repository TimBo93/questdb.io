---
title: Insert data
description:
  This page demonstrates how to insert data into QuestDB from NodeJS, Java, Go
  and cURL. The examples show how to use the REST API as well as the InfluxDB
  integration.
---

This page shows how to insert data into QuestDB using different programming
languages and tools.

## Prerequisites

This page assumes that QuestDB is running and accessible. To get started, follow
one of the guides to get up and running using either
[Docker](/docs/get-started/docker/), the [binaries](/docs/get-started/binaries/)
or [Homebrew](/docs/get-started/homebrew/) for macOS users.

## REST API

QuestDB exposes a REST API for compatibility with a wide range of libraries and
tools. The REST API is accessible on port `9000` and has the following
entrypoints:

- `/imp` - import data
- `/exec` - execute an SQL statement

More details on the use of these entrypoints can be found on the
[REST API reference](/docs/reference/api/rest/) page.

### `/imp` endpoint

The `/imp` endpoint allows for importing a CSV file directly.

<!-- prettier-ignore-start -->

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

<Tabs defaultValue="curl" values={[
  { label: "cURL", value: "curl" },
  { label: "NodeJS", value: "nodejs" },
  { label: "Go", value: "go" },
]}>

<!-- prettier-ignore-end -->

<TabItem value="curl">

```shell
curl -F data=@data.csv http://localhost:9000/imp
```

</TabItem>

<TabItem value="nodejs">

```javascript
const fetch = require("node-fetch")
const FormData = require("form-data")
const fs = require("fs")
const qs = require("querystring")

const HOST = "http://localhost:9000"

async function run() {
  const form = new FormData()

  form.append("data", fs.readFileSync(__dirname + "/data.csv"), {
    filename: fileMetadata.name,
    contentType: "application/octet-stream",
  })

  try {
    const r = await fetch(`${HOST}/imp`, {
      method: "POST",
      body: form,
      headers: form.getHeaders(),
    })

    console.log(r)
  } catch (e) {
    console.error(e)
  }
}

run()
```

</TabItem>

<TabItem value="go">

```go
package main

import (
	"bytes"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"mime/multipart"
	"net/http"
	"net/url"
	"os"
)

func main() {
	u, err := url.Parse("http://localhost:9000")
	checkErr(err)
	u.Path += "imp"
	url := fmt.Sprintf("%v", u)
	fileName := "/path/to/data.csv"
	file, err := os.Open(fileName)
	checkErr(err)

	defer file.Close()

	buf := new(bytes.Buffer)
	writer := multipart.NewWriter(buf)
	uploadFile, _ := writer.CreateFormFile("data", "data.csv")
	_, err = io.Copy(uploadFile, file)
	checkErr(err)
	writer.Close()

	req, err := http.NewRequest(http.MethodPut, url, buf)
	checkErr(err)
	req.Header.Add("Content-Type", writer.FormDataContentType())

	client := &http.Client{}
	res, err := client.Do(req)
	checkErr(err)

	defer res.Body.Close()

	body, err := ioutil.ReadAll(res.Body)
	checkErr(err)

	log.Println(string(body))
}

func checkErr(err error) {
	if err != nil {
		panic(err)
	}
}
```

</TabItem>

</Tabs>

### `/exec` endpoint

Alternatively, the `/exec` endpoint can be used to create a table and the
`INSERT` statement can be used to populate it with values:

<!-- prettier-ignore-start -->

<Tabs defaultValue="curl" values={[
  { label: "cURL", value: "curl" },
  { label: "NodeJS", value: "nodejs" },
  { label: "Go", value: "go" },
]}>

<!-- prettier-ignore-end -->

<TabItem value="curl">

```shell
# Create Table
curl -G \
  --data-urlencode "query=CREATE TABLE IF NOT EXISTS trades(name STRING, value INT)" \
  http://localhost:9000/exec

# Insert a row
curl -G \
  --data-urlencode "query=INSERT INTO trades VALUES('abc', 123456);" \
  http://localhost:9000/exec
```

Note that these two queries can be combined into a single curl request:

```shell
curl -G \
  --data-urlencode "query=CREATE TABLE IF NOT EXISTS trades(name STRING, value INT);\
  INSERT INTO trades VALUES('abc', 123456);" \
  http://localhost:9000/exec
```

</TabItem>

<TabItem value="nodejs">

The `node-fetch` package can be installed using `npm i node-fetch`.

```javascript
const fetch = require("node-fetch")
const qs = require("querystring")

const HOST = "http://localhost:9000"

async function createTable() {
  try {
    const queryData = {
      query: "CREATE TABLE IF NOT EXISTS trades (name STRING, value INT);",
    }

    const response = await fetch(`${HOST}/exec?${qs.encode(queryData)}`)
    const json = await response.json()

    console.log(json)
  } catch (error) {
    console.log(error)
  }
}

async function insertData() {
  try {
    const queryData = {
      query: "INSERT INTO trades VALUES('abc', 123456);",
    }

    const response = await fetch(`${HOST}/exec?${qs.encode(queryData)}`)
    const json = await response.json()

    console.log(json)
  } catch (error) {
    console.log(error)
  }
}

createTable()
insertData()
```

</TabItem>

<TabItem value="go">

```go
package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
)

func main() {
	u, err := url.Parse("http://localhost:9000")
	checkErr(err)

	u.Path += "exec"
	params := url.Values{}
	params.Add("query", `
		CREATE TABLE IF NOT EXISTS
			trades (name STRING, value INT);
		INSERT INTO
			trades
		VALUES(
			"abc",
			123456
		);
	`)
	u.RawQuery = params.Encode()
	url := fmt.Sprintf("%v", u)

	res, err := http.Get(url)
	checkErr(err)

	defer res.Body.Close()

	body, err := ioutil.ReadAll(res.Body)
	checkErr(err)

	log.Println(string(body))
}

func checkErr(err error) {
	if err != nil {
		panic(err)
	}
}
```

</TabItem>

</Tabs>

## InfluxDB line protocol

QuestDB implements the [InfluxDB line protocol](/docs/reference/api/influxdb/),
this endpoint is accessible on port `9009`. These examples assume the `trades`
table created in the section above exists already.

<!-- prettier-ignore-start -->

<Tabs defaultValue="nodejs" values={[
  { label: "NodeJS", value: "nodejs" },
  { label: "Go", value: "go" },
]}>

<!-- prettier-ignore-end -->

<TabItem value="nodejs">

```javascript
const net = require("net")

const client = new net.Socket()

const HOST = "localhost"
const PORT = 9009

function run() {
  client.connect(PORT, HOST, () => {
    const rows = [
      `trades,name=test_ilp1 value=12.4 ${Date.now() * 1e6}`,
      `trades,name=test_ilp2 value=11.4 ${Date.now() * 1e6}`,
    ]

    rows.forEach((row) => {
      client.write(`${row}\n`)
    })

    client.destroy()
  })

  client.on("data", function (data) {
    console.log("Received: " + data)
  })

  client.on("close", function () {
    console.log("Connection closed")
  })
}

run()
```

</TabItem>

<TabItem value="go">

```go
package main

import (
	"fmt"
	"io/ioutil"
	"net"
	"time"
)

func main() {
	host := "127.0.0.1:9009"
	tcpAddr, err := net.ResolveTCPAddr("tcp4", host)
	checkErr(err)
	rows := [2]string{
		fmt.Sprintf("trades,name=test_ilp1 value=12.4 %d", time.Now().UnixNano()),
		fmt.Sprintf("trades,name=test_ilp2 value=11.4 %d", time.Now().UnixNano()),
	}

	conn, err := net.DialTCP("tcp", nil, tcpAddr)
	checkErr(err)
	defer conn.Close()

	for _, s := range rows {
		_, err = conn.Write([]byte(fmt.Sprintf("%s\n", s)))
		checkErr(err)
	}

	result, err := ioutil.ReadAll(conn)
	checkErr(err)

	fmt.Println(string(result))
}

func checkErr(err error) {
	if err != nil {
		panic(err)
	}
}
```

</TabItem>

</Tabs>

## PostgreSQL wire protocol

You can query data using the [Postgres](/docs/reference/api/postgres/) endpoint
that QuestDB exposes. This is accessible via port `8812`.
<!-- prettier-ignore-start -->

<Tabs defaultValue="nodejs" values={[
  { label: "NodeJS", value: "nodejs" },
  { label: "Go", value: "go" },
  { label: "Rust", value: "rust" },
  { label: "Java", value: "java" },
  { label: "C", value: "c" },
  { label: "Python", value: "python" },
]}>

<!-- prettier-ignore-end -->

<TabItem value="nodejs">

These examples use the [`pg` package](https://www.npmjs.com/package/pg) which
allows for quickly building queries using PostgreSQL wire protocol. Details on
the use of this package can be found on the
[node-postgres documentation](https://node-postgres.com/).

```javascript title="Basic client connection"
const { Client } = require("pg");

const start = async () => {
  try {
    const client = new Client({
      database: "qdb",
      host: "127.0.0.1",
      password: "quest",
      port: 8812,
      user: "admin",
    });
    await client.connect();

    const createTable = await client.query(
      "CREATE TABLE IF NOT EXISTS trades (name STRING, value INT);"
    );
    console.log(createTable);

    const insertData = await client.query(
      "INSERT INTO trades VALUES('abc', 123456);"
    );
    console.log(insertData);

    const readAll = await client.query("SELECT * FROM trades");
    console.log(readAll.rows);

    await client.end();
  } catch (e) {
    console.log(e);
  }
};

start();
```

The following example demonstrates `pg` support for connection pooling,
parameterized queries and prepared statements. For more details on the use of
prepared statements with this package, see the
[`node-postgres` documentation for queries](https://node-postgres.com/features/queries).

```javascript title="Using a connection pool"
const { Pool } = require("pg");

config = {
  database: "qdb",
  host: "127.0.0.1",
  password: "quest",
  port: 8812,
  user: "admin",
};

// The config is passed to every client instance when the pool creates a client
const pool = new Pool(config);

function runQuery(query) {
  pool.connect((err, client, release) => {
    if (err) {
      return console.error("Error acquiring client", err.stack);
    }
    client.query(query, (err, result) => {
      console.log(`Query successful:\n  ${query}\n`, result);
      release();
      if (err) {
        return console.error(`Error executing query:\n ${query}`, err.stack);
      }
    });
  });
}
// Passing basic text-only queries
runQuery("CREATE TABLE IF NOT EXISTS trades (name STRING, value INT);");
runQuery("INSERT INTO trades VALUES('abc', 123456);");

function parameterizedQuery() {
  pool.connect((err, client, release) => {
    if (err) {
      return console.error("Error acquiring client", err.stack);
    }
    // Construct a parameterized query
    const text = "INSERT INTO trades VALUES($1, $2);";
    const values = ["abc", 123];
    client.query(text, values, (err, result) => {
      release();
      if (err) {
        return console.error("Error executing query", err.stack);
      }
      console.log(`Inserted ${result.rowCount} row from parameterized query`);
    });
  });
}

function preparedStatement() {
  for (let rows = 0; rows < 10; rows++) {
    pool.connect((err, client, release) => {
      if (err) {
        return console.error("Error acquiring client", err.stack);
      }
      // Providing a 'name' field allows for prepared statements
      const query = {
        name: "insert-values",
        text: "INSERT INTO trades VALUES($1, $2);",
        values: ["abc", rows],
      };
      client.query(query, (err, result) => {
        if (err) {
          return console.error("Error executing query", err.stack);
        }
        release();
        console.log(`Inserted ${result.rowCount} row from prepared statement`);
      });
    });
  }
}

parameterizedQuery();
preparedStatement();

// Drain pool, disconnect clients, and shut down internal timers
pool.end().then(() => console.log("pool has ended"));
```

</TabItem>

<TabItem value="go">

```go
package main

import (
	"context"
	"fmt"
	"log"

	"github.com/jackc/pgx/v4"
)

func createTable() {
	ctx := context.Background()
	conn, err := pgx.Connect(ctx, "postgresql://admin:quest@localhost:8812/qdb")
	defer conn.Close(ctx)

	query, err := conn.Query(ctx, "CREATE TABLE IF NOT EXISTS trades (name STRING, value INT);")
	if err != nil {
		log.Fatalln(err)
	}

	// Parameterized Query
	rows, _ := conn.Query(ctx, "INSERT INTO trades(name,value) VALUES($1,$2)", "first row", 123)
	fmt.Println(rows)

	defer query.Close()
	err = conn.Close(ctx)
}

func preparedStatement() {
	ctx := context.Background()
	conn, err := pgx.Connect(ctx, "postgresql://admin:quest@localhost:8812/qdb")
	defer conn.Close(ctx)

	// Prepared statement has the name 'ps1'
	_, err = conn.Prepare(ctx, "ps1", "insert into trades values ($1, $2)")
	if err != nil {
		log.Fatalln(err)
	}

	for i := 0; i < 20; i++ {
		// Execute 'ps1' statement with a string and the loop iterator value
		_, err = conn.Exec(ctx, "ps1", "prep abc", i)
		if err != nil {
			log.Fatalln(err)
		}
	}
}

func readTable() {
	ctx := context.Background()
	conn, err := pgx.Connect(ctx, "postgresql://admin:quest@localhost:8812/qdb")
	if err != nil {
		log.Fatalln(err)
	}
	defer conn.Close(ctx)

	rows, err := conn.Query(ctx, "SELECT * FROM trades")
	defer rows.Close()

	for rows.Next() {
		var value int
		var name string
		err = rows.Scan(&name, &value)
		fmt.Println(name, value)
	}

	err = conn.Close(ctx)
}

func main() {
	createTable()
	preparedStatement()
	readTable()
}
```

</TabItem>

<TabItem value="rust">

The following example shows how to use parameterized queries and prepared statements:

```rust
use postgres::{Client, NoTls, Error};

fn main() -> Result<(), Error> {
    let mut client = Client::connect("postgresql://admin:quest@localhost:8812/qdb", NoTls)?;
    let name = "abc";
    let val = 123;

    // Parameterized Query
    client.execute(
        "INSERT INTO trades (name, value) VALUES ($1, $2)",
        &[&name, &val],
    )?;

    // Prepared statement
    let mut txn = client.transaction()?;
    let statement = txn.prepare("insert into trades values ($1,$2)")?;

    for value in 0..100 {
        txn.execute(&statement, &[&name, &value])?;
    }
    txn.commit()?;

    println!("import finished");
    Ok(())

}
```

</TabItem>

<TabItem value="java">

```java
package com.myco;

import java.sql.*;
import java.util.Properties;

class App {
  public static void main(String[] args) throws SQLException {
    Properties properties = new Properties();
    properties.setProperty("user", "admin");
    properties.setProperty("password", "quest");
    properties.setProperty("sslmode", "disable");

    final Connection connection = DriverManager.getConnection("jdbc:postgresql://localhost:8812/qdb", properties);
    try (PreparedStatement preparedStatement = connection.prepareStatement("INSERT INTO TRADES (id, ref) VALUES (?, ?)")) {
      preparedStatement.setString(1, "abc");
      preparedStatement.setInt(2, 123);
      preparedStatement.execute();
    }
    System.out.println("Done");
    connection.close();
  }
}

```

</TabItem>

<TabItem value="c">

```c
// compile with
// g++ libpq_example.c -o libpq_example.exe  -I pgsql\include -L dev\pgsql\lib
// -std=c++17  -lpthread -lpq
#include <libpq-fe.h>
#include <stdio.h>
#include <stdlib.h>
void do_exit(PGconn *conn) {
    PQfinish(conn);
    exit(1);
}
int main() {
    PGconn *conn = PQconnectdb(
            "host=localhost user=admin password=quest port=8812 dbname=testdb");
    if (PQstatus(conn) == CONNECTION_BAD) {
        fprintf(stderr, "Connection to database failed: %s\n",
                PQerrorMessage(conn));
        do_exit(conn);
    }
    PGresult *res = PQexec(conn, "INSERT INTO trades VALUES ('abc', 123);");
    PQclear(res);
    PQfinish(conn);
    printf("Done\n");
    return 0;
}
```

</TabItem>

<TabItem value="python">

```python
import psycopg2
try:
    connection = psycopg2.connect(user="admin",
                                  password="quest",
                                  host="127.0.0.1",
                                  port="8812",
                                  database="qdb")
    cursor = connection.cursor()
    postgreSQL_select_Query = "INSERT INTO trades VALUES ('abc', 123)"
    cursor.execute(postgreSQL_select_Query)
    print("Inserted row")
finally:
    #closing database connection.
    if (connection):
        cursor.close()
        connection.close()
        print("PostgreSQL connection is closed")

```

</TabItem>

</Tabs>

## Web Console

Our Web Console has an import function. You can find out more about this on the
[dedicated page](/docs/reference/client/web-console/#import).
