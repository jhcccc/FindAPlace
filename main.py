import os
import time
import json
import subprocess
import random
import math
from telegram_send import *

def hasSpace(section):
    WLAvailable = int(section["WLRem"]) > 0
    RemAvailable = int(section["Rem"]) > 0
    if not WLAvailable:
        return RemAvailable or section["clickable"]
    return WLAvailable

datafile = "data.json"
found = False

while True:
    waitTime = random.randint(900,3600)
    try:
        if os.path.exists(datafile):
            os.remove(datafile)
        else: 
            send(["FindAPlace: datafile not found"])
        subprocess.run(["node", "check.js"], timeout=120)
        sections = json.loads(open(datafile).read())
        for section in sections:
            if hasSpace(section):
                send(["Place found! CRN "+ section["CRN"]])
                found = True
    except subprocess.TimeoutExpired:
        send(["FindAPlace: TimeoutExpired"])
    if not found:
        send(["No place found! Checking again in "+str(waitTime/60)+" minutes"])
    time.sleep(waitTime)