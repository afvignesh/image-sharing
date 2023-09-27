# End to End Encrypted Image Sharing
In this project we have created a sample app that illustrates end to end encryption in image sharing.
The basic algo we follow is we encrypt image while uploading using a symmetric key and then we encrypt
the symmetric key using the public key of each individual with whom we are sharing the image.

## Environment Setup
Before running the application, make sure to set up the necessary environment variables.

Create a .env file in the project root.
Add the following variables:

```bash
DB_USERNAME=postgres
DB_NAME=imageservice
DB_PASSWORD=admin
DB_PORT=5432
JWT_SECRET=test123 // can use whatever u want 
```

## Installation

``` bash
make install
```

## Running the Application

``` bash
make setup.up
```

## Deleting the Application Resource

``` bash
make setup.down
```

It is adviced to always delete the resources as it may not give you any error the next time you use it.

# APIs

**GET /register**  
Register user with username and password. We also create users public and private key here.

**POST /login**  
Login method for user.

**POST /upload-from-client**  
Upload image from client side. This is used to replicate client side functions.

**POST /upload-image**  
Upload image from the main app. This is the main api which our backend will use to store data sent from client.

**POST /get-from-client/:imageId**  
Get uploaded image. This is used to replicate client side function.

**POST /get-image/:imageId**  
View uploaded image. This is used to replicate server side function.

## Error Handling

If any API encounters an error, it will return an appropriate status code and a JSON object with an error key containing a description of the error.

## Dependencies

This project utilizes several libraries and tools:

**Express:** for setting up the web server.  
**Axios:** for making HTTP requests.  
**Dotenv:** for managing environment variables.  
**PG (node-postgres):** for interacting with PostgreSQL databases.  