// netlify/functions/getData.js
const faunadb = require('faunadb')
const q = faunadb.query

exports.handler = async (event) => {
  const client = new faunadb.Client({
    secret: process.env.FAUNA_SECRET_KEY
  })

  try {
    const userId = event.queryStringParameters.userId
    
    const result = await client.query(
      q.Get(q.Match(q.Index('user_data_by_id'), userId))
    )

    return {
      statusCode: 200,
      body: JSON.stringify(result.data)
    }
  } catch (error) {
    if (error.name === 'NotFound') {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'No data found' })
      }
    }
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to retrieve data' })
    }
  }
}