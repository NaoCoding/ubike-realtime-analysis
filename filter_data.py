import os
filelist = os.listdir("./data")

for file in filelist:
    file_time = file.split(".")[0]
    if file_time > "202412130802":
        os.remove("./data/" + file)
        