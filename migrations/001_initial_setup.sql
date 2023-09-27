\c imageservice;

CREATE TABLE users (
username VARCHAR(255) PRIMARY KEY,
password VARCHAR(255) NOT NULL,
salt VARCHAR(255) NOT NULL,
public_key TEXT NOT NULL
);

CREATE TABLE shared_users (
id SERIAL PRIMARY KEY,
image_id VARCHAR(255) NOT NULL, -- Foreign key to associate with the image being shared
user_id VARCHAR(255) NOT NULL, -- Foreign key to associate with the user who can access the image
encrypted_symmetric_key TEXT NOT NULL -- Text field for storing the encrypted symmetric key
);

CREATE TABLE images (
image_id VARCHAR(255) PRIMARY KEY,
encrypted_image TEXT NOT NULL, -- Text field for storing the base64-encoded encrypted image
hash_value VARCHAR(255)
);

CREATE INDEX shared_users_image_user_idx ON shared_users (image_id, user_id);