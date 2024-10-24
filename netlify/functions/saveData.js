// netlify/functions/saveData.js
const faunadb = require('faunadb')
const q = faunadb.query

exports.handler = async (event) => {
  const client = new faunadb.Client({
    secret: process.env.FAUNA_SECRET_KEY
  })

  try {
    const data = JSON.parse(event.body)
    const userId = event.queryStringParameters.userId

    await client.query(
      q.Let(
        {
          match: q.Match(q.Index('user_data_by_id'), userId)
        },
        q.If(
          q.Exists(q.Var('match')),
          q.Replace(
            q.Select('ref', q.Get(q.Var('match'))),
            { data: { userId, ...data } }
          ),
          q.Create(
            q.Collection('user_data'),
            { data: { userId, ...data } }
          )
        )
      )
    )

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Data saved successfully' })
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to save data' })
    }
  }
}