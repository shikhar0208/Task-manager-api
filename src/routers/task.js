const express = require('express')
const Task = require('../models/task')
const router = new express.Router()
const auth = require ('../middleware/auth')

router.post('/tasks', auth, async (req, res) => {
    // const task = new Task(req.body)
    const task = new Task({
        ...req.body,                  // this will copy all of the properties from the body over to this object
        owner: req.user._id
    })
    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send()
    }
})


//GET /tasks?completed=true

// GET /tasks?limit=10&skip=0              
//Limit helps to show limited no. of task at a page 
// with skip=0 we show first 10 result on the page, if skip=10 we skip first 10 and getting the second set of 10 results 

// GET /tasks?sortBy=createdAt:asc (for ascending) or :desc (for descending)

router.get('/tasks', auth, async (req, res) =>{
    const match = {}        // this is only a const of object type
    const sort = {}

    if(req.query.completed){   // if any query(?completed=true) is not given then it will display all the task as the cond. is false 
        match.completed = req.query.completed === 'true'
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')         // this split the query string in 2 parts (i.e before colon and after colon)
        sort[parts[0]] = parts[1] === 'desc'? -1 : 1            // ternary operator
    }   

    try {
        await req.user.populate({
            path: 'tasks',
            match,                       // here we use shorthand tech.
            options: {
                limit: parseInt(req.query.limit),   // parseInt allows us to pass string containing a number into it 
                skip:  parseInt(req.query.skip),
                sort                // for asc we use 1 and for desc = -1
            }
        }).execPopulate()
        res.send(req.user.tasks)
    } catch (e) {
        res.status(500).send()
    } 
})

router.get('/tasks/:id',auth, async (req, res) =>{
    const _id = req.params.id

    try {
        const task = await Task.findOne({_id, owner: req.user._id})
        
        if(!task){
            return res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

// To Update

router.patch('/tasks/:id', auth, async (req, res) => {

    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOperation){
        return res.status(400).send({error: 'Invalid updates'})
    }

    try{
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id})
    

        
        if(!task){
            return res.status(404).send()
        }

        updates.forEach((update) => {
            task[update] = req.body[update]
        })

        await task.save()
        res.send(task)

    } catch (e){
        res.status(400).send(e)
    }
})


router.delete('/tasks/:id', auth, async (req,res) => {
    try{
        const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id})
        if(!task){
            return res.status(404).send()
        }
        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router