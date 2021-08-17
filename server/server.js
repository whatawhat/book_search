const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { authMiddleware } = require ('.utils/auth');
const mongoose = require('mongoose');
const path = require('path');
const db = require('./config/connection');
const routes = require('./routes');
const { typeDefs, resolvers } = require('./schemas');

const app = express();
const PORT = process.env.PORT || 3001;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware
})

server.applyMiddleware({app});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../clent/build/index.html'));
});

mongoose.connect(
  process.env.MONGODB_URI || 'mongodb://localhost/googlebooks' , 
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  }
);

//app.use(routes);

db.once('open', () => {
  app.listen(process.env.PORT || PORT, () => {
    console.log(`API server running on port ${PORT}!`);
    console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
  });
  //app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}`));
});

process.on('uncaughtException', function(err) {
  console.log('Caught exception: ' + err);
});
