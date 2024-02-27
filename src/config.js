const mongoose = require('mongoose');
const atlasURI = "mongodb+srv://bbxx77:NurAli2013@cluster0.o4f0yrh.mongodb.net/users?retryWrites=true&w=majority";

mongoose.connect(atlasURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("Database Connected Successfully");
}).catch((error) => {
  console.error("Database cannot be Connected:", error);
});

const loginSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: null
  },
  deletedAt: {
    type: Date,
    default: null
  },
  isAdmin: {
    type: Boolean,
    default: false, 
    required: true
  },
});

const UserModel = mongoose.model('users', loginSchema);

const userActionSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  result: {
    title: String,
    author: String,
    firstPublishYear: String,
    publishYears: [String],
  },
});

const UserActionModel = mongoose.model('users_action', userActionSchema);

const bookSchema = new mongoose.Schema({
  images: [String],
  titles: {
      language1: String,
      language2: String,
  },
  descriptions: {
      language1: String,
      language2: String,
  },
  timestamps: {
      createdAt: {
          type: Date,
          default: Date.now,
      },
      updatedAt: {
          type: Date,
          default: null,
      },
      deletedAt: {
          type: Date,
          default: null,
      },
  },
});

const BookModel = mongoose.model('books', bookSchema);

module.exports = {
  UserModel,
  UserActionModel,
  BookModel
};
