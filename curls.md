# This file contains sample curls

## 1. Register User  

```
curl -X POST http://localhost:3000/auth/register   -H "Content-Type: application/json"   -d '{
    "username": "testuser1",
    "password": "test"
}'
```

## 2. Login User  

```
curl -X POST http://localhost:3000/auth/login   -H "Content-Type: application/json"   -d '{
"username": "testuser1",
"password": "test"
}'
```

## 3. Upload Image  

```
curl -X POST http://localhost:3000/img/upload-from-client -H "Content-Type: application/json" -H "Authorization: Bearer __your_auth_token_here__" -d '{
    "sharedWithUsernames": ["testuser2"],
    "imagePath": "/usr/src/app/test_img/test1.png"
}'
```

## 4. View Image  

```
curl --location --request GET 'http://localhost:3000/img/get-from-client/:image_Id' \
--header 'Authorization: Bearer __your_token_here__' \
--header 'Content-Type: application/json' \
--data '{}'
```

## 4. Add More Users to Share List

```
curl -X POST http://localhost:3000/img/add-shared-users-client -H "Content-Type: application/json" -H "Authorization: Bearer __your_auth_token_here__" -d '{
    "shared_users": ["testuser1"],
    "image_id": "ff129173-5e5a-46da-b2ee-aee76d14ee86"
}'
```

