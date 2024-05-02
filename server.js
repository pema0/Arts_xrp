const mongoose = require('mongoose');
const app = require('./app.js');

const PORT = process.env.PORT || 3002;

// Set up your MongoDB connection
mongoose.connect("mongodb+srv://12210056gcit:Do0ln8QXDsecTuAs@cluster0.qdcrmq7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
    .then(() => {
        console.log('Mongoose Connected');
    })
    .catch((e) => {
        console.log('failed');
    });

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
