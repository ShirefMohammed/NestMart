CREATE TABLE Users (
  _id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT NOT NULL,
  email        TEXT UNIQUE NOT NULL,
  password     TEXT NOT NULL,
  avatar       TEXT DEFAULT 'defaultAvatar.png',
  createdAt    INTEGER NOT NULL,
  updatedAt    INTEGER NOT NULL,
  isVerified   BOOLEAN NOT NULL DEFAULT 0,
  role         INTEGER NOT NULL DEFAULT 2001,
  phone        TEXT,
  country      TEXT,
  city         TEXT
);

CREATE TABLE Users_Verification_Tokens (
  userId              INTEGER NOT NULL,
  verificationToken   TEXT NOT NULL,
  PRIMARY KEY (userId),
  FOREIGN KEY (userId) REFERENCES Users(_id)
);

CREATE TABLE Users_Reset_Password_Tokens (
  userId               INTEGER NOT NULL,
  resetPasswordToken   TEXT NOT NULL,
  PRIMARY KEY (userId),
  FOREIGN KEY (userId) REFERENCES Users(_id)
);

CREATE TABLE Categories (
  _id         INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT UNIQUE NOT NULL,
  image       TEXT NOT NULL,
  createdAt   INTEGER NOT NULL
);

CREATE TABLE Products (
  _id           INTEGER PRIMARY KEY AUTOINCREMENT,
  title         TEXT NOT NULL UNIQUE,
  desc          TEXT NOT NULL,
  price         INTEGER NOT NULL,
  createdAt     INTEGER NOT NULL,
  updatedAt     INTEGER NOT NULL,
  discount      INTEGER NOT NULL CHECK (discount BETWEEN 0 AND 100),
  available     INTEGER NOT NULL,
  categoryId    INTEGER NOT NULL,
  FOREIGN KEY (categoryId) REFERENCES Categories(_id)
);

CREATE TABLE Products_Images (
  productId   INTEGER NOT NULL,
  image       TEXT NOT NULL,
  PRIMARY KEY (productId, image),
  FOREIGN KEY (productId) REFERENCES Products(_id)
);

CREATE TABLE Users_Carts (
  userId      INTEGER NOT NULL,
  productId   INTEGER NOT NULL,
  PRIMARY KEY (userId, productId),
  FOREIGN KEY (userId) REFERENCES Users(_id),
  FOREIGN KEY (productId) REFERENCES Products(_id)
);

CREATE TABLE Orders (
  _id          INTEGER PRIMARY KEY AUTOINCREMENT,
  creatorId    INTEGER NOT NULL,
  totalPrice   INTEGER NOT NULL,
  createdAt    INTEGER NOT NULL,
  FOREIGN KEY (creatorId) REFERENCES Users(_id)
);

CREATE TABLE Orders_Items (
  orderId      INTEGER NOT NULL,
  productId    INTEGER NOT NULL,
  quantity     INTEGER NOT NULL,
  totalPrice   INTEGER NOT NULL,
  PRIMARY KEY (orderId, productId),
  FOREIGN KEY (orderId) REFERENCES Orders(_id),
  FOREIGN KEY (productId) REFERENCES Products(_id)
);

CREATE TABLE Chats (
  _id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  updatedAt           INTEGER NOT NULL,
  customerId          INTEGER NOT NULL,
  lastMsgId           INTEGER,
  lastNotReadMsgId    INTEGER,
  FOREIGN KEY (customerId) REFERENCES Users(_id),
  FOREIGN KEY (lastMsgId) REFERENCES Messages(_id),
  FOREIGN KEY (lastNotReadMsgId) REFERENCES Messages(_id)
);

CREATE TABLE Messages (
  _id          INTEGER PRIMARY KEY AUTOINCREMENT,
  content      TEXT NOT NULL,
  createdAt    INTEGER NOT NULL,
  chatId       INTEGER NOT NULL,
  senderId     INTEGER NOT NULL,
  FOREIGN KEY (chatId) REFERENCES Chats(_id),
  FOREIGN KEY (senderId) REFERENCES Users(_id)
);

CREATE TABLE Messages_Notifications (
  _id          INTEGER PRIMARY KEY AUTOINCREMENT,
  isRead       BOOLEAN NOT NULL DEFAULT 0,
  createdAt    INTEGER NOT NULL,
  messageId    INTEGER NOT NULL,
  senderId     INTEGER NOT NULL,
  receiverId   INTEGER NOT NULL,
  FOREIGN KEY (messageId) REFERENCES Messages(_id),
  FOREIGN KEY (senderId) REFERENCES Users(_id),
  FOREIGN KEY (receiverId) REFERENCES Users(_id)
);

CREATE TABLE Orders_Notifications (
  _id          INTEGER PRIMARY KEY AUTOINCREMENT,
  isRead       BOOLEAN NOT NULL DEFAULT 0,
  createdAt    INTEGER NOT NULL,
  orderId      INTEGER NOT NULL,
  senderId     INTEGER NOT NULL,
  receiverId   INTEGER NOT NULL,
  FOREIGN KEY (orderId) REFERENCES Orders(_id),
  FOREIGN KEY (senderId) REFERENCES Users(_id),
  FOREIGN KEY (receiverId) REFERENCES Users(_id)
);