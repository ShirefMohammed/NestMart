# ERD: NestMart

This document explores the design of a NestMart an e-commerce web app which market our company products, and give customer a flexibility to buy our products.

## Storage

We'll use a relational database (schema follows) to fast retrieval of products. A minimal database implementation such as sqlite3 suffices. All data and media will be stored on the disk of our app.

### Schema:

We'll need the following entities to implement the service:

**Users**:
| Column | Type | Constraints |
| ---------- | ------- | --------------------------- |
| \_id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| name | TEXT | NOT NULL |
| email | TEXT | NOT NULL |
| password | TEXT | NOT NULL |
| avatar | TEXT | DEFAULT 'defaultAvatar.png' |
| createdAt | INTEGER | NOT NULL |
| updatedAt | INTEGER | NOT NULL |
| isVerified | BOOLEAN | NOT NULL DEFAULT 0 |
| role | INTEGER | NOT NULL DEFAULT 1000 |
| phone | TEXT | |
| country | TEXT | |
| city | TEXT | |

**Users_Verification_Tokens**:
| Column | Type | Constraints |
| ------------------------------------------- | ------- | --------------------- |
| userId | INTEGER | NOT NULL, PRIMARY KEY |
| verificationToken | TEXT | NOT NULL |

**Users_Reset_Password_Tokens**:
| Column | Type | Constraints |
| ------------------------------------------- | ------- | --------------------- |
| userId | INTEGER | NOT NULL, PRIMARY KEY |
| resetPasswordToken | TEXT | NOT NULL |

**Categories**:
| Column | Type | Constraints |
| --------- | ------- | ------------------------- |
| \_id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| title | TEXT | NOT NULL |
| image | TEXT | NOT NULL |
| createdAt | INTEGER | NOT NULL |

**Products**:
| Column | Type | Constraints |
| ---------------------------------------------------- | ------- | -------------------------------------------- |
| \_id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| title | TEXT | NOT NULL |
| description | TEXT | NOT NULL |
| price | INTEGER | NOT NULL |
| createdAt | INTEGER | NOT NULL |
| updatedAt | INTEGER | NOT NULL |
| discount | INTEGER | NOT NULL, CHECK (discount BETWEEN 0 AND 100) |
| available | INTEGER | NOT NULL |
| categoryId | INTEGER | NOT NULL |

**Products_Images**:
| Column | Type | Constraints |
| ------------------------------------------------- | ------- | ----------- |
| productId | INTEGER | NOT NULL |
| image | TEXT | NOT NULL |

**Users_Cart**:
| Column | Type | Constraints |
| ------------------------------------------------- | ------- | ----------------------------------------- |
| userId | INTEGER | NOT NULL, PRIMARY KEY (userId, productId) |
| productId | INTEGER | NOT NULL |

**Orders**:
| Column | Type | Constraints |
| ---------------------------------------------- | ------- | ------------------------- |
| \_id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| creatorId | INTEGER | NOT NULL |
| totalPrice | INTEGER | NOT NULL |
| createdAt | INTEGER | NOT NULL |

**Orders_Items**:
| Column | Type | Constraints |
| ------------------------------------------------- | ------- | ------------------------------------------ |
| orderId | INTEGER | NOT NULL, PRIMARY KEY (orderId, productId) |
| productId | INTEGER | NOT NULL |
| quantity | INTEGER | NOT NULL |
| totalPrice | INTEGER | NOT NULL |

**Chats**:
| Column | Type | Constraints |
| ---------------------------------------------- | ------- | ------------------------- |
| \_id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| updatedAt | INTEGER | NOT NULL |
| creatorId | INTEGER | NOT NULL |

**Messages**:
| Column | Type | Constraints |
| ----------------------------------------------- | ------- | ------------------------- |
| \_id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| content | TEXT | NOT NULL |
| createdAt | INTEGER | NOT NULL |
| chatId | INTEGER | NOT NULL |
| senderId | INTEGER | NOT NULL |

**Messages_Notifications**:
| Column | Type | Constraints |
| ------------------------------------------------- | ------- | ------------------------- |
| \_id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| isRead | BOOLEAN | NOT NULL DEFAULT 0 |
| createdAt | INTEGER | NOT NULL |
| messageId | INTEGER | NOT NULL |
| senderId | INTEGER | NOT NULL |
| receiverId | INTEGER | NOT NULL |

**Orders_Notifications**:
| Column | Type | Constraints |
| ----------------------------------------------- | ------- | ------------------------- |
| \_id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| isRead | BOOLEAN | NOT NULL DEFAULT 0 |
| createdAt | INTEGER | NOT NULL |
| orderId | INTEGER | NOT NULL |
| senderId | INTEGER | NOT NULL |
| receiverId | INTEGER | NOT NULL |

### Auth

For v1, a simple JWT-based auth mechanism is to be used, with passwords
encrypted and stored in the database. OAuth is to be added initially or later
for Google + Facebook and maybe others (Github?).

## APIs

**Authentication**:

```
post: /auth/register
post: /auth/login
get: /auth/refresh
get: /auth/logout
get: /auth/verifyAccount
post: /auth/forgetPassword
get: /auth/resetPassword
```

**Users**:

```
get: /users/new
get: /users/userId
patch: /users/userId
delete: /users/userId
```

**Product**:

```
Get products:
  get: /products/all
  get: /products/new
  get: /products/random
  get: /products/popular
Create, read, update and delete product:
  post: /products/new
  get: /products/productId
  patch: /products/productId
  delete: /products/productId
```

**Categories**:

```
get: /categories/
post: /categories/new
get: /categories/categoryId
patch: /categories/categoryId
delete: /categories/categoryId
get: /categories/categoryId/products
```

**Cart**:

```
get: /cart/
post: /cart/productId
delete: /cart/productId
```

**Notifications**:

```
get: /notifications
get: /notifications/notificationId
patch: /notifications/notificationId
delete: /notifications/notificationId
```

**Chat**:

```
Get chats and create new chat:
  get: /chats/
  post: /chats/new
Get, update and delete chat:
  get: /chats/chatId
  patch: /chats/chatId
  delete: /chats/chatId
Get chat messages and create new message:
  get: /chats/chatId/messages
  post: /chats/chatId/messages/new
Get, update and delete message:
  get: /chats/chatId/messages/messageId
  patch: /chats/chatId/messages/messageId
  delete: /chats/chatId/messages/messageId
```

## Used Technologies

- HTML
- CSS
- JavaScript
- Typescript
- Tailwind CSS
- React.js
- Node.js
- Express.js
- SQLite
- Firebase (to backup images)
- Socket.IO (for real-time chat and notifications)
- JWT for authentication
- Jest (for testing)

## Clients

we'll start with a single web client..

The web client will be implemented in React.js.

See Figma/screenshots for details.

API server will serve a static bundle of the React app.

Uses Tailwind CSS UI for building the CSS components.

## Hosting

The code will be hosted on Github, PRs and issues welcome.

The web client and server will be hosted on render platform.

The server will have closed CORS policy except
for the domain name and the web host server.
