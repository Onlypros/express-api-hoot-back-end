const express = require('express')
const router = express.Router()
const HootModel = require('../models/hoot')

router.post('/', async function(req, res) {
    console.log(req.body, '<- this is the contents of the form')
    console.log(req.user, ' <- req.user from the JWT')
    req.body.author = req.user._id
    try {
        const hootDoc = await HootModel.create(req.body)
        // if we want to send back the author property with the whole object
        // instead just the userId
        hootDoc._doc.author = req.user
        res.status(201).json(hootDoc);
    } catch (error) {
        console.log(error);
        res.status(500).json({error: error.message});
    }
}); // THIS IS THE CREATE ROUTE
// YOU MUST USE THE BEARER TOKEN AND USE BODY/RAW TO LIST OUT THE FIELDS
// {
//     "title": "word word",
//     "text": "word words",
//     "category": "Music"
// }


router.get('/', async function(req, res){
    try {
        // the .populate is when you have a referenced  property
        // in this case author (check the model to see the reference)
        // and it replaces the id with the object that the id references 
        const hootDocs = await HootModel.find({}).populate('author')
        res.status(200).json(hootDocs);
    } catch(error){
        res.status(500).json({error: error.message});
    }
});  // THIS IS THE INDEX ROUTE
// MUST USE BEARER TOKEN

router.get('/:id', async function(req, res){
    try {
        const hootDoc = await HootModel.findById(req.params.id).populate('author');
        res.status(200).json(hootDoc)
    } catch(error){
        res.status(500).json({error: error.message});
    }
}); // THIS IS THE SHOW ROUTE
// MUST USE BEARER TOKEN

router.delete('/:id', async function (req, res){
    try {
        // only the user who created the hoot shouuld be able to update it
        // frist check to see if the user owns this document
        const hootDoc = await HootModel.findById(req.params.id);

         // .equals is a mongoose method for comparing mongodb id's
        // we cant use the === we need to use the .equals method
        if(!hootDoc.author.equals(req.user._id)){
            res.status(403).json({
                message: "you're not allowed to delete a hoot"
            });
        }    
        
        const deletedHoot = await HootModel.findByIdAndDelete(req.params.id)

        res.status(200).json({message: 'Item was succfessuly deleted'})

    } catch (error){
        console.log(error)
        res.status(500).json({error: error.message})
    }
}); // THIS IS THE DELETE ROUTE
// MUST USE BEARER TOKEN

router.put('/:id', async function(req, res){
    try {
        // only the user who created the hoot shouuld be able to update it
        // frist check to see if the user owns this document
        const hootDoc = await HootModel.findById(req.params.id);

        // .equals is a mongoose method for comparing mongodb id's
        // we cant use the === we need to use the .equals method
        if(!hootDoc.author.equals(req.user._id)){
            res.status(403).json({
                message: "you're not allowed to update a hoot"
            });
        }
        // ANOTHER WAY TO DO THE ABOVE LOGIC
        // const userHootDoc = await HootModel.findOne({author: req.user._id, _id: req.params.id})

        // {new true} is the options that says return the updated hoot document
        const updatedHoot = await HootModel.findByIdAndUpdate(req.params.id, req.body, {new: true})

        // append the user property so we dont have to populate
        updatedHoot._doc.author = req.user;

        res.status(200).json(updatedHoot);
    } catch(error){
        res.status(500).json({error: error.message});
    }
}); // THIS IS THE UPDATE ROUTE
// MUST USE BEARER TOKEN

router.post('/:hootId/comments', async function(req, res){
    console.log(req.body)
    console.log(req.user)
    try {
        // assigning the author to req.body so we have an object that matches the shape of the comment schema
        req.body.author = req.user._id
        // find the hoot so we can add the comment to the hoots comments array

        // res.json({ message: 'comment create route'}) // use this the first time to test before you build the rest
        const hootDoc = await HootModel.findById(req.params.hootId);
        // add the comment to the comments array
        hootDoc.comments.push(req.body);
        // we have to tell the DB that we added the comment to the hoot array
        await hootDoc.save();

        //grab the new comment which is the last comment in the array
        // const newComment = hootDoc.comments[hootDoc.comments.length-1]
        // newComment._doc.author = req.user

        // another way to above, becuase we are populating on a document 
        await hootDoc.populate('comments.author')

        // up to us what we want to send back
        res.status(201).json(hootDoc);

    } catch(error){

        res.status(500).json({error: error.message});
    }
}); // THIS IS THE CREATE COMMENTS ROUTE
// MUST USE BEARER TOKEN AND TOP LVL ID

module.exports = router
