import json
import random
import boto3
import os
import logging
from botocore.exceptions import ClientError

def lambda_handler(event, context):

    print(event)
    
    def is_pangram(string): 
        #checks if a string has only 7 unique letters 
        if len(set(list(string))) == 7: return True 
        return False

    if 'detail-type' in event:
    ##for the daily generation of letters and their possible words
        if event['detail-type'] == 'Scheduled Event':
            worddict = dict()
            #generate possible sets of 7 letters (unique and form a word)
            with open('validwords.json', 'r') as dictfile:
                worddict = json.load(dictfile)
                pangram_set = set()
                for k in worddict: 
                    if is_pangram(k): 
                        letterset = frozenset(k)
                        pangram_set.add(letterset)

            #choose a random set of 7 letters    
            todays_letters = list(random.choice(list(pangram_set)))
    
            #compute the possible words from these 7 letters in the dictionary file 
            res = [] 
            center_letter = todays_letters[3]
            pangram = ''
            for w in worddict: 
                flag = True
                for c in w: 
                    if c not in todays_letters: 
                        flag = False 
                if center_letter not in w: 
                    flag = False 
                if flag == True:
                    if is_pangram(w): pangram = w
                    res.append(w)
    
            #write today's letters and possible words to a separate json file in s3 bucket
            s3 = boto3.client('s3')
            bucket_name = os.environ['BUCKET_NAME']
            data = {'letters':todays_letters, 'pangram': pangram, 'possible_words':res, 'center_letter': center_letter}
            key = os.environ['FILE_KEY']
            response = s3.put_object(Bucket=bucket_name,Key=key,Body=json.dumps(data),ACL='public-read')
            return response

    
    if 'queryStringParameters' in event: 
    ## for the return of letters and details from the http request to the api endpoint 
        bucket_name = os.environ['BUCKET_NAME']
        key = os.environ['FILE_KEY']
        s3 = boto3.resource('s3')

        try:
            #download a temporary copy of today's letters and possible words
            s3.Bucket(bucket_name).download_file(key, '/tmp/todays_letters.json')
        except ClientError as e:
            #return if error occured downloading the file
            if e.response['Error']['Code'] == "404":
                return { 'statusCode': 404, 'body': 'Oops! Could not find today\'s word file.'  } 
            else:
                return { 'statusCode': 500, 'body': "Uh oh, an error occurred"  }
            
        with open('/tmp/todays_letters.json', 'r') as rdfile: 
            #open the file, read the contents and return as response
            data = rdfile.read()
            print(data)
            data = json.loads(data)
            return  { 'statusCode': 200, 'body': json.dumps(data, indent=4)}
          
        
                