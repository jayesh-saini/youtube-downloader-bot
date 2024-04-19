import redis
from time import sleep
from pytube import YouTube
import mysql.connector
import uuid
import os
import json
from dotenv import load_dotenv

load_dotenv()
queue = redis.Redis(decode_responses=True)

publicYtDownloadPath = os.path.join(os.getcwd(), "downloads")

def log(id, chat_id, rsp, name, username):
    try:
        mydb = mysql.connector.connect(
            host=os.getenv("DB_HOSTNAME"),
            user=os.getenv("DB_USERNAME"),
            password=os.getenv("DB_PASSWORD"),
            database=os.getenv("DB_DATABASE"),
            auth_plugin=os.getenv("DB_AUTH_PLUGIN")
        )

        statement = "INSERT INTO big_file_urls(UUID, CHAT_ID, FILE_NAME, NAME, USERNAME) VALUES(%s, %s, %s, %s, %s)"
        
        data = (id, chat_id, rsp, name, username)
        cur = mydb.cursor()
        cur.execute(statement, data)
        mydb.commit()
        cur.close()
        mydb.close()
        return 1
    except mysql.connector.Error as my_error:
        print(my_error)
        return 0

while True:

    data = json.loads(queue.brpop("youtube_download_queue")[1])
    print('----------')
    video_url = data["video_url"]
    name = data["name"]
    username = data["username"]
    chat_id = data["chat_id"]

    yt = YouTube(video_url, use_oauth=True, allow_oauth_cache=True)

    print("Downloading: ", yt.title)
    rsp = yt.streams.get_highest_resolution().download(publicYtDownloadPath)
    print("File Path: ", rsp)
    fileSize = os.path.getsize(rsp)
    id = str(uuid.uuid4())

    r = log(id, chat_id, rsp, name, username)
    if (r == 1):
        queue.publish('download_complete', id)
    else:
        print("Unable to update DB!")