import datetime
import md5

def generate_unique_code():
    now        = datetime.datetime.now()
    hashstring = md5.new(str(now)).hexdigest()
    return hashstring[:4] + '-' + hashstring[4:8]