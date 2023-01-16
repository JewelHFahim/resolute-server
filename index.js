const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pahlhyl.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run(){
    const studentsCollection = client.db("crudTask").collection("students");

    try{

        app.post('/students', async(req, res)=>{
            const user = req.body;
            const result = await studentsCollection.insertOne(user);
            res.send(result)
        })
        app.get('/students', async(req, res)=>{
            const query = {};
            const users = await studentsCollection.find(query).toArray();
            res.send(users);
        })
        app.get('/students/:id', async(req, res)=>{
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await studentsCollection.findOne(query);
            res.send(result)
        })
        app.delete('/students/:id', async(req, res)=>{
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await studentsCollection.deleteOne(query);
            res.send(result)
        })

        // update a single product
        app.put('/students/:id', async(req, res)=>{
            const id = req.params.id;
            const filter = {_id: ObjectId(id)}
            const updateUser = req.body;
            console.log(updateUser);
            const options = {upsert: true};

            const updatedDoc = {
              $set:{
                name : updateUser.name,
                email : updateUser.email,
                phone: updateUser.phone,
                gender: updateUser.gender,
                department: updateUser.department,
                address: updateUser.address
              }
            }
            const result = await studentsCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
          })

    }
    finally{

    }

}
run().catch(error=>console.log(error))

app.get('/', (req, res)=>{
    res.send('Server working...!!')
})

app.listen(port, (req, res)=>{
    console.log('CRUD-', port);
})