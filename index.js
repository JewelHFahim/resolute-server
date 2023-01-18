const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const stripe = require("stripe")(process.env.STRIPE_SK);

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pahlhyl.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run(){
    const usersCollection = client.db("crudTask").collection("users");
    const coursesCollection = client.db("crudTask").collection("courses");
    const enrolledCoursesCollection = client.db("crudTask").collection("enrolled");
    

    // JWT Verify
    function verifyJWT(req, res, next){
      const authHeader = req.headers.authorization;
      if(!authHeader){
          return res.status(401).send({message: 'unauthorized access'});
      }
      const token = authHeader.split(' ')[1];
      jwt.verify(token, process.env.JWT_TOKEN, function(err, decoded){
          if(err){
            return res.status(401).send({message: 'unauthorized access'})
          }
          req.decoded = decoded;
          next();
      }) 
    }

    try{
          // JWT
          app.post('/jwt', (req, res)=>{
            const user = req.body;
            const token = jwt.sign(user, process.env.JWT_TOKEN, {expiresIn: '1d'});
            res.send({token});
        }) 

        // Payement
        // app.post("/create-payment-intent", async(req, res) => {
        //   const needPriceData = req.body;
        //   const price = needPriceData.price;
        //   const amount = 10 * 100;
        //   const paymentIntent = await stripe.paymentIntents.create({
        //     currencey: 'usd',
        //     amount: amount,
        //     "payment_method_types": [
        //       "card"
        //     ]
        //   });
        //   res.send({ clientSecret: paymentIntent.client_secret });
        // })
          

        //   Signup/ Login USer
        app.post('/users',  async(req, res)=>{
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
        })
        app.get('/users', async(req, res)=>{
            const query = {};
            const users = await usersCollection.find(query).toArray();
            res.send(users);
        })
        
        app.get('/users/:id',verifyJWT, async(req, res)=>{
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await usersCollection.findOne(query);
            res.send(result)
        })
        app.delete('/users/:id', async(req, res)=>{
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await usersCollection.deleteOne(query);
            res.send(result)
        })
        app.put('/users/:id',verifyJWT, async(req, res)=>{
            const id = req.params.id;
            const filter = {_id: ObjectId(id)}
            const updateUser = req.body;
            const options = {upsert: true};
            const updatedDoc = {
              $set:{
                name : updateUser.name,
                email : updateUser.email,
                phone: updateUser.phone,
                gender: updateUser.gender,
                department: updateUser.department,
                address: updateUser.address,
              }
            }
            const result = await usersCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
          })
        

          // Admin
          app.get('/users/admin/:email',verifyJWT, async(req, res)=>{
            const email = req.params.email;
            const query = { email };
            const user = await usersCollection.findOne(query);
            res.send({ isAdmin: user?.designation === 'admin'});
          })

          app.get('/users/student/:email',verifyJWT, async(req, res)=>{
            const email = req.params.email;
            const query = { email };
            const user = await usersCollection.findOne(query);
            res.send({ isStudent: user?.designation === 'Student'});
          })
            
          app.get('/users/teacher/:email',verifyJWT, async(req, res)=>{
            const email = req.params.email;
            const query = { email };
            const user = await usersCollection.findOne(query);
            res.send({ isTeacher: user?.designation === 'Teacher'});
          })   
            

          // Courses
          app.get('/courses', async(req, res)=>{
            const query = {};
            const courses = await coursesCollection.find(query).toArray();
            res.send(courses);
          })
        app.post('/enrolled',verifyJWT,  async(req, res)=>{
          const user = req.body;
          const result = await enrolledCoursesCollection.insertOne(user);
          res.send(result);
        })
        app.get('/enrolled', async(req, res)=>{
          const query = {};
          const courses = await enrolledCoursesCollection.find(query).toArray();
          res.send(courses);
        })
        app.delete('/enrolled/:id', async(req, res)=>{
          const id = req.params.id;
          const query = { _id: ObjectId(id) };
          const result = await enrolledCoursesCollection.deleteOne(query);
          res.send(result)
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