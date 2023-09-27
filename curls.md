# This file contains sample curls

## 1. Register User  

```
curl -X POST http://localhost:3000/auth/register   -H "Content-Type: application/json"   -d '{
    "username": "testuser",
    "password": "test"
}'
```

## 2. Login User  

```
curl -X POST http://localhost:3000/auth/login   -H "Content-Type: application/json"   -d '{
"username": "testuser",
"password": "test"
}'
```

## 3. Upload Image  

```
curl -X POST http://localhost:3000/img/upload-from-client -H "Content-Type: application/json" -H "Authorization: Bearer __your_token_here__" -d '{
    "sharedWithUsernames": ["testuser1", "testuser2]
    "imagePath": "/usr/src/app/test_img/test1.png"
}'
```

## 4. View Image  

```
curl --location --request GET 'http://localhost:3000/img/get-from-client/2ae4077c-3cd3-488e-bee4-2fc69ba1e151' \
--header 'Authorization: Bearer __your_token_here__' \
--header 'Content-Type: application/json' \
--data '{}'
```

