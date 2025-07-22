const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/test', (req, res) => {
    res.json({ message: 'Server is working!' });
});

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/todo')
    .then(async () => {
        console.log('TCP Connection established to MongoDB');
        // Test actual database access
        try {
            // Try to list collections - this will verify we have proper access
            await mongoose.connection.db.listCollections().toArray();
            console.log('✅ Successfully connected and authenticated with MongoDB');
        } catch (error) {
            console.error('❌ MongoDB Authentication failed:', error.message);
            // Exit process since we can't operate without database access
            process.exit(1);
        }
    })
    .catch((err) => {
        console.error('Failed to connect to MongoDB:', err.message);
        process.exit(1);
    });

// Todo Schema
const todoSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Todo = mongoose.model('List', todoSchema);

// Routes

// GET all todos
app.get('/api/todos', async (req, res) => {
    try {
        const todos = await Todo.find().sort({ createdAt: -1 });
        return res.json(todos);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

// POST new todo
app.post('/api/todos', async (req, res) => {
    try {
        const todo = new Todo({
            text: req.body.text
        });
        const newTodo = await todo.save();
        res.status(201).json(newTodo);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT update todo
app.put('/api/todos/:id', async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);
        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }

        if (req.body.text !== undefined) {
            todo.text = req.body.text;
        }
        if (req.body.completed !== undefined) {
            todo.completed = req.body.completed;
        }

        const updatedTodo = await todo.save();
        res.json(updatedTodo);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE todo
app.delete('/api/todos/:id', async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);
        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }
        await todo.deleteOne();
        res.json({ message: 'Todo deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
