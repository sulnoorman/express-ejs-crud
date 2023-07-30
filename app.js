const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const expressLayout = require('express-ejs-layouts')
const { connect, getConnectedClient } = require('./db/db')
const { PORT } = require('./shared')
const { ObjectId } = require('mongodb');
const e = require('express');

// api middelwares
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }))

app.set('view engine', 'ejs');

// public static file
app.use(express.static('public'));
app.use('/css', express.static('public/css'));

// define default layot
app.use(expressLayout);
app.set('layout', 'layouts/layout')

// connecting to the database
connect().then(() => {
    // get connected database
    const db = getConnectedClient().db('tokopaedi');
    // index page
    app.get('/', (req, res) => {
        const datas = [
            'Express js for the framework of this website',
            'Embedded Javascript (ejs) template for view engine',
            'Bootstrap 5 for styling and components of website',
            'MongoDB for the database'
        ]

        res.render('pages/index', { datas: datas })
    });

    // about page
    app.get('/about', async (req, res) => {
        try {
            const collection = db.collection('customers');
            const datas = await collection.find({}).toArray();

            res.render('pages/about', { datas: datas })
        } catch (err) {

        }
    });

    // add page
    app.get('/add-data', (req, res) => {
        res.render('pages/add-data', { layout: false })
    })

    // edit page
    app.get('/edit-data/:id', async (req, res) => {
        var id = req.params.id
        try {
            const collection = db.collection('customers');
            const data = await collection.findOne({ _id: new ObjectId(id) })

            res.render('pages/edit-data', { layout: false, data: data })
        } catch (err) {
            res.status(500).json({ message: err.message })
        }
    })


    //--- api routes
    app.post('/create', async (req, res) => {
        const data = {
            '_id': new ObjectId(),
            'namaDepan': req.body.namaDepan || '-',
            'namaBelakang': req.body.namaBelakang || '-',
            'email': req.body.email || '-',
            'saldo': req.body.saldo || '-',
            'aktif': true
        }
        try {
            if (!req.body.namaDepan || !req.body.namaBelakang) {
                res.status(400).json({ message: 'all field is required' })
            } else {
                const collection = db.collection('customers');
                const datas = await collection.insertOne(data);

                if (datas) {
                    console.log('insert data success')
                    setTimeout(() => {
                        res.redirect('/about')
                    }, 2000)
                }
            }
        } catch (err) {
            res.json({ message: err.message })
        }
    })

    app.get('/delete/:id', async (req, res) => {
        var id = req.params.id;
        try {
            const collection = db.collection('customers');
            const data = await collection.deleteOne({ _id: new ObjectId(id) });

            if (data.deletedCount !== 0) {
                console.log('delete data success');
                res.redirect('/about')
            } else {
                console.log('data tidak terhapus', data)
            }
        } catch (err) {

        }
    })

    app.post('/update/:id', async (req, res) => {
        var id = req.params.id
        var objData = {
            'namaDepan': req.body.namaDepan,
            'namaBelakang': req.body.namaBelakang,
            'email': req.body.email,
            'saldo': req.body.saldo,
            'aktif': req.body.status === 'undefined' ? true : false
        }
        try {
            const collection = db.collection('customers');
            const data = await collection.replaceOne({ _id: new ObjectId(id) }, objData)

            if (data) {
                console.log('update data success')
                setTimeout(() => {
                    res.redirect('/about')
                }, 2000)
            }
        } catch (err) {
            res.status(500).json({ message: err.message })
        }
    })

    app.listen(PORT, () => {
        console.log('Server running on port ' + PORT)
    });
})