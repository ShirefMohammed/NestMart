# ERD: NestMart

This document explores the design of a NestMart an e-commerce web app which market our company products, and give customer a flexibility to buy our products.

## Storage

We'll use a relational database (schema follows) to fast retrieval of products. A minimal database implementation such as sqlite3 suffices. All data and media will be stored on the disk of our app.

### Schema:

We'll need the following entities to implement the service:

**Users**:
| Column | Type | Constraints |
| ------ | ---- | ----------- |
| \_id | INTEGER | PK AUTOINCREMENT |
| name | TEXT | NOT NULL |
| email | TEXT | UNIQUE NOT NULL |
| password | TEXT | NOT NULL |
| avatar | TEXT | DEFAULT 'defaultAvatar.png' |
| createdAt | INTEGER | NOT NULL |
| updatedAt | INTEGER | NOT NULL |
| isVerified | BOOLEAN | NOT NULL DEFAULT 0 |
| role | INTEGER | NOT NULL DEFAULT ROLES_LIST.User |
| phone | TEXT | |
| country | TEXT | |
| city | TEXT | |

**Users_Verification_Tokens**:
| Column | Type | Constraints |
| ------ | ---- | ----------- |
| userId | INTEGER | NOT NULL, PK, FK |
| verificationToken | TEXT | NOT NULL |

**Users_Reset_Password_Tokens**:
| Column | Type | Constraints |
| ------ | ---- | ----------- |
| userId | INTEGER | NOT NULL, PK, FK |
| resetPasswordToken | TEXT | NOT NULL |

**Categories**:
| Column | Type | Constraints |
| ------ | ---- | ----------- |
| \_id | INTEGER | PK AUTOINCREMENT |
| title | TEXT | UNIQUE NOT NULL |
| image | TEXT | NOT NULL |
| createdAt | INTEGER | NOT NULL |

**Products**:
| Column | Type | Constraints |
| ------ | ---- | ----------- |
| \_id | INTEGER | PK AUTOINCREMENT |
| title | TEXT | NOT NULL |
| desc | TEXT | NOT NULL |
| price | INTEGER | NOT NULL |
| createdAt | INTEGER | NOT NULL |
| updatedAt | INTEGER | NOT NULL |
| discount | INTEGER | NOT NULL, CHECK (discount BETWEEN 0 AND 100) |
| available | INTEGER | NOT NULL |
| categoryId | INTEGER | NOT NULL, FK |

**Products_Images**:
| Column | Type | Constraints |
| ------ | ---- | ----------- |
| productId | INTEGER | NOT NULL, PK, FK |
| image | TEXT | NOT NULL, PK |

**Users_Carts**:
| Column | Type | Constraints |
| ------ | ---- | ----------- |
| userId | INTEGER | NOT NULL, PK, FK |
| productId | INTEGER | NOT NULL, PK, FK |

**Orders**:
| Column | Type | Constraints |
| ------ | ---- | ----------- |
| \_id | INTEGER | PK AUTOINCREMENT |
| creatorId | INTEGER | NOT NULL |
| totalPrice | INTEGER | NOT NULL |
| createdAt | INTEGER | NOT NULL |

**Orders_Items**:
| Column | Type | Constraints |
| ------ | ---- | ----------- |
| orderId | INTEGER | NOT NULL, PK, FK |
| productId | INTEGER | NOT NULL, PK, FK |
| quantity | INTEGER | NOT NULL |
| totalPrice | INTEGER | NOT NULL |

**Chats**:
| Column | Type | Constraints |
| ------ | ---- | ----------- |
| \_id | INTEGER | PK AUTOINCREMENT |
| updatedAt | INTEGER | NOT NULL |
| customerId | INTEGER | NOT NULL, FK |
| lastMsgId | INTEGER | FK |
| lastNotReadMsgId | INTEGER | FK |

**Messages**:
| Column | Type | Constraints |
| ------ | ---- | ----------- |
| \_id | INTEGER | PK AUTOINCREMENT |
| content | TEXT | NOT NULL |
| createdAt | INTEGER | NOT NULL |
| chatId | INTEGER | NOT NULL, FK |
| senderId | INTEGER | NOT NULL, FK |

**Messages_Notifications**:
| Column | Type | Constraints |
| ------ | ---- | ----------- |
| \_id | INTEGER | PK AUTOINCREMENT |
| isRead | BOOLEAN | NOT NULL DEFAULT 0 |
| createdAt | INTEGER | NOT NULL |
| messageId | INTEGER | NOT NULL, FK |
| senderId | INTEGER | NOT NULL, FK |
| receiverId | INTEGER | NOT NULL, FK |

**Orders_Notifications**:
| Column | Type | Constraints |
| ------ | ---- | ----------- |
| \_id | INTEGER | PK AUTOINCREMENT |
| isRead | BOOLEAN | NOT NULL DEFAULT 0 |
| createdAt | INTEGER | NOT NULL |
| orderId | INTEGER | NOT NULL, FK |
| senderId | INTEGER | NOT NULL, FK |
| receiverId | INTEGER | NOT NULL, FK |

### Auth

For v1, a simple JWT-based auth mechanism is to be used, with passwords
encrypted and stored in the database. OAuth is to be added initially or later
for Google + Facebook and maybe others (Github?).

## APIs

**Auth**:

```
post: /auth/register
post: /auth/login
get: /auth/refresh
get: /auth/logout
get: /auth/verifyAccount
post: /auth/forgetPassword
get: /auth/resetPassword
post: /auth/resetPassword
```

**Users**:

```
get: /users
get: /users/search
get: /users/userId
patch: /users/userId
delete: /users/userId
```

**Categories**:

```
get: /categories
get: /categories/search
post: /categories
get: /categories/categoryId
patch: /categories/categoryId
delete: /categories/categoryId
get: /categories/categoryId/products
```

**Products**:

```
get: /products
get: /products/search
post: /products
get: /products/productId
patch: /products/productId
delete: /products/productId
```

**Orders**:

```
get: /orders
post: /orders
get: /orders/all
get: /orders/orderId
delete: /orders/orderId
```

**Carts**:

```
get: /cart
post: /cart/productId
delete: /cart/productId
```

**Notifications**:

```
get: /notifications
patch: /notifications/notificationId
delete: /notifications/notificationId
```

**Chats**:

```
Get chats and create new chat:
  get: /chats
  post: /chats
Get, update and delete chat:
  get: /chats/chatId
  patch: /chats/chatId
  delete: /chats/chatId
Get chat messages and create new message:
  get: /chats/chatId/messages
  post: /chats/chatId/messages
Delete message:
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
- Socket.IO (for real-time chat and notifications)
- JWT for authentication

## Clients

we'll start with a single web client..

The web client will be implemented in React.js.

See screenshots for details.

API server will serve a static bundle of the React app.

Uses Tailwind CSS UI for building the CSS components.

## Hosting

The code will be hosted on Github, PRs and issues welcome.

The web client and server will be hosted on render platform.

The server will have closed CORS policy except
for the domain name and the web host server.
