const express = require('express')
const bcrypt = require('bcryptjs')

require('./db/mongoose')   // that's going to ensure that file runs and it's going to ensure that mongoose connects to the database.

const userRouter = require('./routers/user')
const taskRouter = require('./routers/task') 
const app = express()

const port = process.env.PORT           // Environment variable
// in dev.env file
// Important to make sure not to add any extra formatting including spaces in between the various characters.




app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen (port, () => {
    console.log('Server is up on port ' + port)
})


