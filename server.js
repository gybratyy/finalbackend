const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const app = require('./app');

const DB = process.env.DATABASE;

mongoose
    .connect(DB.replace('<PASSWORD>', process.env.DATABASE_PASSWORD), {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('DB connection successful!'));

// Start server
const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});
