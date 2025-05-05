const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log(`MongoDB подключена: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Ошибка: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB; 