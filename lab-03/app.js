
const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'books.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

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

// API 1: Get all books with search, sorting, pagination and price filtering

app.get('/books/', async (request, response) => {
  const {
    offset = 0,
    limit = 5,
    order = 'ASC',
    order_by = 'id',
    search_q = '',
    min_price,
    max_price,
  } = request.query

  const validColumns = ['id', 'title', 'author', 'price', 'pages']

  if (!validColumns.includes(order_by)) {
    return response.status(400).send({
      message: 'Invalid order_by column',
    })
  }

  if (
    typeof order !== 'string' ||
    !['ASC', 'DESC'].includes(order.toUpperCase())
  ) {
    return response.status(400).send({
      message: 'Order must be ASC or DESC',
    })
  }

  if (
    !/^\d+$/.test(String(limit)) ||
    Number(limit) <= 0 ||
    !/^\d+$/.test(String(offset))
  ) {
    return response.status(400).send({
      message: 'Invalid limit or offset',
    })
  }

  if (
    (min_price !== undefined &&
      (min_price === '' ||
        !Number.isFinite(Number(min_price)) ||
        Number(min_price) < 0)) ||
    (max_price !== undefined &&
      (max_price === '' ||
        !Number.isFinite(Number(max_price)) ||
        Number(max_price) < 0))
  ) {
    return response.status(400).send({
      message: 'Invalid price range',
    })
  }

  if (
    min_price !== undefined &&
    max_price !== undefined &&
    Number(min_price) > Number(max_price)
  ) {
    return response.status(400).send({
      message: 'Minimum price cannot be greater than maximum price',
    })
  }

  let getBooksQuery = `
    SELECT *
    FROM book
    WHERE title LIKE ?
  `

  const queryParams = [`%${search_q}%`]

  if (min_price !== undefined) {
    getBooksQuery += ` AND price >= ?`
    queryParams.push(Number(min_price))
  }

  if (max_price !== undefined) {
    getBooksQuery += ` AND price <= ?`
    queryParams.push(Number(max_price))
  }

  getBooksQuery += ` ORDER BY ${order_by} ${order.toUpperCase()} LIMIT ? OFFSET ?;`

  queryParams.push(Number(limit), Number(offset))

  try {
    const booksArray = await db.all(getBooksQuery, queryParams)
    response.status(200).send(booksArray)
  } catch (e) {
    response.status(500).send({
      message: 'Unable to fetch books',
    })
  }
})

// API 2: Get book by ID

app.get('/books/:bookId/', async (request, response) => {
  const {bookId} = request.params

  const getBookQuery = `
    SELECT *
    FROM book
    WHERE id = ?;
  `

  try {
    const book = await db.get(getBookQuery, [bookId])

    if (book === undefined) {
      return response.status(404).send({
        message: 'Book Not Found',
      })
    }

    response.status(200).send(book)
  } catch (e) {
    response.status(500).send({
      message: 'Unable to fetch book',
    })
  }
})

// API 3: Add a new book

app.post('/books/', async (request, response) => {
  const {title, author, price, pages} = request.body

  if (
    !title ||
    !author ||
    price === undefined ||
    price === null ||
    price === ''
  ) {
    return response.status(400).send({
      message: 'Title, author and price are required',
    })
  }

  if (!Number.isFinite(Number(price))) {
    return response.status(400).send({
      message: 'Price must be a number',
    })
  }

  if (Number(price) < 0) {
    return response.status(400).send({
      message: 'Price cannot be negative',
    })
  }

  const addBookQuery = `
    INSERT INTO book (title, author, price, pages)
    VALUES (?, ?, ?, ?);
  `

  try {
    await db.run(addBookQuery, [
      title,
      author,
      Number(price),
      pages,
    ])

    response.status(201).send({
      message: 'Book Added Successfully',
    })
  } catch (e) {
    response.status(500).send({
      message: 'Unable to add book',
    })
  }
})

// API 4: Update book by ID

app.put('/books/:bookId/', async (request, response) => {
  const {bookId} = request.params
  const {title, author, price, pages} = request.body

  if (
    !title ||
    !author ||
    price === undefined ||
    price === null ||
    price === '' ||
    !Number.isFinite(Number(price)) ||
    Number(price) < 0
  ) {
    return response.status(400).send({
      message: 'Valid title, author and price are required',
    })
  }

  const getBookQuery = `
    SELECT *
    FROM book
    WHERE id = ?;
  `

  try {
    const book = await db.get(getBookQuery, [bookId])

    if (book === undefined) {
      return response.status(404).send({
        message: 'Book Not Found',
      })
    }

    const updateBookQuery = `
      UPDATE book
      SET
        title = ?,
        author = ?,
        price = ?,
        pages = ?
      WHERE id = ?;
    `

    await db.run(updateBookQuery, [
      title,
      author,
      Number(price),
      pages,
      bookId,
    ])

    response.status(200).send({
      message: 'Book Updated Successfully',
    })
  } catch (e) {
    response.status(500).send({
      message: 'Unable to update book',
    })
  }
})

// API 5: Delete book by ID

app.delete('/books/:bookId/', async (request, response) => {
  const {bookId} = request.params

  const getBookQuery = `
    SELECT *
    FROM book
    WHERE id = ?;
  `

  try {
    const book = await db.get(getBookQuery, [bookId])

    if (book === undefined) {
      return response.status(404).send({
        message: 'Book Not Found',
      })
    }

    const deleteBookQuery = `
      DELETE FROM book
      WHERE id = ?;
    `

    await db.run(deleteBookQuery, [bookId])

    response.status(200).send({
      message: 'Book Deleted Successfully',
    })
  } catch (e) {
    response.status(500).send({
      message: 'Unable to delete book',
    })
  }
})

module.exports = app
