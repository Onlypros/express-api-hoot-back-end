const mongoose = require("mongoose")

const commentSchema = mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    // 1 to many relationship between user and comments using referncing
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
})

const hootSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enums: ['New', 'Sports', 'Games', 'Movie', 'Music', 'Televison']
    },
    // 1 to many relationship between user and hoots using refencing
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    // embedding 1 hoot has many comments, comment belongs to A hoot
    comments: [commentSchema]
})

module.exports = mongoose.model('Hoot', hootSchema)