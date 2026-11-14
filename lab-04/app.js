
const express = require('express')
const path = require('path')
const bcrypt = require('bcrypt')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const jwt = require('jsonwebtoken')
const app = express()
app.use(express.json())
const JWT_SECRET = 'MY_SECRET_TOKEN'
const dbPath = path.join(__dirname, 'users.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    await db.run(`
      CREATE TABLE IF NOT EXISTS user (
        username TEXT UNIQUE,
        name TEXT,
        password TEXT
      );
    `)

    const PORT = process.env.PORT || 3000

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server Running at http://localhost:${PORT}/`)
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

// API 1: Register a new user
app.post('/register/', async (request, response) => {
  const {username, name, password} = request.body

  const getUserQuery = `
    SELECT *
    FROM user
    WHERE username = ?;
  `

  const existingUser = await db.get(getUserQuery, [username])

  if (existingUser !== undefined) {
    return response.status(400).send({
      message: 'User already exists',
    })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const createUserQuery = `
    INSERT INTO user (username, name, password)
    VALUES (?, ?, ?);
  `

  await db.run(createUserQuery, [username, name, hashedPassword])

  response.status(200).send({
    message: 'User created successfully',
  })
})

// API 2: Login user
app.post('/login/', async (request, response) => {
  const {username, password} = request.body

  const getUserQuery = `
    SELECT *
    FROM user
    WHERE username = ?;
  `

  const user = await db.get(getUserQuery, [username])

  if (user === undefined) {
    return response.status(400).send({
      message: 'Invalid user',
    })
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password)

  if (isPasswordMatched === false) {
    return response.status(400).send({
      message: 'Invalid password',
    })
  }

  const payload = {
    username: username,
  }

  const jwtToken = jwt.sign(payload, JWT_SECRET)

  response.send({
    jwt_token: jwtToken,
  })
})

module.exports = app
