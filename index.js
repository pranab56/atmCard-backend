const express = require('express');
const cors = require('cors'); 
const { MongoClient, ObjectId } = require('mongodb');
const app = express();

const mongoURI = 'mongodb+srv://azizdada:gWFZMbXyPHNbmxzM@cluster0.fa9ax0e.mongodb.net/';

app.use(cors({origin:'http://localhost:3000'}));

async function connectToMongoDB() {
    try {
        const client = await MongoClient.connect(mongoURI, { useNewUrlParser: true });
        console.log('Connected to MongoDB');

        const db = client.db(); // Get the database object

        // Create operation
        app.post('/create', async (req, res) => {
            try {
                const user = req.body;
                const result = await db.collection('users').insertOne(user);
                res.json(result);
            } catch (err) {
                console.error('Error creating user:', err);
                res.status(500).json({ error: 'Failed to create user' });
            }
        });

        // Read operation
        app.get('/users', async (req, res) => {
            try {
                const users = await db.collection('users').find().toArray();
                res.json(users);
            } catch (err) {
                console.error('Error fetching users:', err);
                res.status(500).json({ error: 'Failed to fetch users' });
            }
        });

        // Update operation
        app.put('/update/:id', async (req, res) => {
            try {
                const { id } = req.params;
                const user = req.body;
                const result = await db.collection('users').updateOne(
                    { _id:new ObjectId(id) },
                    { $set: user }
                );
                res.json({ message: `${result.modifiedCount} user updated` });
            } catch (err) {
                console.error('Error updating user:', err);
                res.status(500).json({ error: 'Failed to update user' });
            }
        });

        // Delete operation
        app.delete('/delete/:id', async (req, res) => {
            try {
                const { id } = req.params;
        
                // Convert id to ObjectId
                const objectId = new ObjectId(id);


                // Delete the user
                const result = await db.collection('users').deleteOne({ _id: objectId });
        
                // Check if a user was deleted
                if (result.deletedCount === 1) {
                    res.json({ message: `${result.deletedCount} user deleted` });
                } else {
                    res.status(404).json({ error: 'User not found' });
                }
            } catch (err) {
                console.error('Error deleting user:', err);
                res.status(500).json({ error: 'Failed to delete user' });
            }
        });
        // Close the MongoDB connection when your server shuts down
        process.on('SIGINT', () => {
            client.close().then(() => {
                console.log('MongoDB connection closed');
                process.exit(0);
            });
        });
    } catch (err) {
        console.error('Failed to connect to MongoDB:', err);
        process.exit(1); // Exit the process with an error code
    }
}

connectToMongoDB();

// Middleware to parse JSON bodies
app.use(express.json());

app.get('/',(req,res)=>{
  res.send('hello world')
})

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
