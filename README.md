
# Youtube Downloader Bot

### High Level Architecture Diagram
![App Screenshot](https://github.com/jayesh-saini/youtube-downloader-bot/blob/main/screenshots/youtube-downloader-bot-arch-diagram.jpeg?raw=true)

### Bot Screenshot
![App Screenshot](https://github.com/jayesh-saini/youtube-downloader-bot/blob/main/screenshots/download_sample.jpeg?raw=true)

## Introduction:

This telegram bot streamlines the retrieval and management of YouTube videos. It simplifies the process by allowing users to send the video URL to the bot, which then promptly responds with the YouTube video itself, its download URL, or both, as per user preference.

## Functional Modules:

The bot comprises three primary modules:

#### 1. Telegram Bot:
   - This component, built using Node.js and leveraging the "node-telegram-bot-api" module, serves as the interface for user interaction.
   - Upon receipt of a video link, the Telegram Bot module validates it and enqueues the link for processing. This queuing mechanism ensures uninterrupted service by preventing blockages from concurrent requests.
   - Upon completion of video processing, the module publishes an event that triggers the transmission of the video file back to the user.
   - Notably, for video files exceeding 50 MB in size, direct transmission via Telegram is prohibited. In such cases, users are provided with a download link to access the video content.

#### 2. Download Worker:
   - This essential module is responsible for downloading YouTube videos. Operating in tandem with the queuing system, it retrieves video URLs from the queue and initiates download processes sequentially.
   - The download worker's scalability is adjustable to accommodate varying request volumes. Multiple workers can be deployed as needed to handle increased demand efficiently.
   - Upon successful completion of a download, the module logs relevant metadata into a SQL database and triggers an event to inform the bot module.

#### 3. File Server:
   - Facilitating internet-based access to video files, the file server employs ngrok for seamless file delivery.
   - Incoming requests are processed by the server, which verifies the video ID from URL parameters in the database. Upon validation, the corresponding video file is dispatched to the user for downloading.


### Usage Instructions:
To utilize our Telegram bot, follow these simple steps:

    1. Open Telegram and search for "@youtube_downloader_19_bot".
    2. Send "video <YouTube video link>" to download the video.
    3. Alternatively, send "audio <YouTube video link>" to download the audio.

### Deployment Guidelines:

For users interested in deploying their own instance of the bot, the following prerequisites and setup steps are required:

#### 1. Prerequisites:
   - Node.js
   - Python3
   - Redis
   - MySQL
   - Telegram account
   - Ngrok account

#### 2. Bot Configuration:
   - Create a bot on Telegram and obtain the bot access token. (Check here if you are not sure how to do it: https://smartbotsland.com/create-edit-bot/get-token-botfather-telegram/)
   - Sign up for an account on Ngrok and obtain the auth token. (Dashboard > Getting Started > Your Authtoken)

#### 3. MySQL Database Setup:
   - Login to mysql 
   ```bash 
   mysql -u root -p
   ```
   - Create a database
   ```bash 
   CREATE DATABASE DB-NAME
   ```
   - Create user
   ```bash 
   CREATE USER 'username'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';
   ```
   - Grant access to this user.
   ```bash 
   GRANT ALL PRIVILEGES ON DB-NAME.* TO 'username'@'localhost';
   ```
   - Flush Privileges
   ```bash 
   FLUSH PRIVILEGES;
   ```
   - Create table
   ```bash
   CREATE TABLE big_file_urls (
      id int NOT NULL AUTO_INCREMENT,
      chat_id varchar(100) DEFAULT NULL,
      uuid varchar(500) DEFAULT NULL,
      file_name varchar(500) DEFAULT NULL,
      name varchar(100) DEFAULT NULL,
      username varchar(100) DEFAULT NULL,
      download_time timestamp NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
   ); 
   ```


#### 4. Module Setup:
   - Navigate to the respective directories ("bot" and "file_server") and install dependencies
        - Bot Module
        ```bash
        cd bot/
        npm install
        ```
        - File Server
        ```bash
        cd file_server/
        npm install
        ```

   - For the download worker module, enter the "download_worker" directory and install dependencies
   ```bash
   pip3 install -r requirements.txt
   ```

Finally, initiate the modules by running the provided commands in separate terminals, ensuring seamless operation of your bot instance.
- Bot
```bash
   node bot/bot.js
   ```
- Download Worker
```bash
   python3 download_worker/download_worker.py
   ```
- File Server
```bash
   node file_serve/server.js
   ```

Your bot is ready to use now. Send the youtube video urls to the bot you had created using bot father.