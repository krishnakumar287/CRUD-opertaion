const express = require('express');
const mongoose = require('mongoose');

const app = express();
const port = 3001;

mongoose.connect('mongodb://localhost:27017/myapp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((error) => {
    console.error('Error connecting to MongoDB', error);
});

const userSchema = new mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});

app.get('/products', (req, res) => {
    res.sendFile(__dirname + '/public/products.html');
});

app.get('/changepassword', (req, res) => {
    res.sendFile(__dirname + '/public/changepassword.html');
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email, password });
        if (user) {
            res.send('Login successful');
        } else {
            res.send('Invalid email or password');
        }
    } catch (error) {
        console.error('Error logging in', error);
        res.status(500).send('Error logging in');
    }
});

app.post('/changepassword', async (req, res) => {
    const { email, oldPassword, newPassword } = req.body;
    try {
        const user = await User.findOne({ email, password: oldPassword });
        if (user) {
            user.password = newPassword;
            await user.save();
            res.send('Password changed successfully');
        } else {
            res.send('Invalid email or old password');
        }
    } catch (error) {
        console.error('Error changing password', error);
        res.status(500).send('Error changing password');
    }
});

app.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send('User already exists');
        }
        const newUser = new User({ email, password });
        await newUser.save();
        res.send('Sign up successful');
    } catch (error) {
        console.error('Error signing up', error);
        res.status(500).send('Error signing up');
    }
});

app.post('/delete', async (req, res) => {
    const { email } = req.body;
    try {
        const deletedUser = await User.findOneAndDelete({ email });
        if (deletedUser) {
            res.send('User deleted successfully');
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        console.error('Error deleting user', error);
        res.status(500).send('Error deleting user');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
