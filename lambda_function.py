import json
import random
import boto3
import os
import logging
from botocore.exceptions import ClientError

def lambda_handler(event, context):
    # TODO implement
    
    print(event)
    
    ##for the daily generation of letters and their possible words
    def is_pangram(string): 
        if len(set(list(string))) == 7: return True 
        return False

    if 'detail-type' in event:
        if event['detail-type'] == 'Scheduled Event':
            worddict = dict()
            with open('validwords.json', 'r') as dictfile:
                worddict = json.load(dictfile)
                pangram_set = set()
                for k in worddict: 
                    if is_pangram(k): 
                        letterset = frozenset(k)
                        pangram_set.add(letterset)
                    
            
            res = [] 
            
            while(len(res) < 15):
                res = []
                todays_letters = list(random.choice(list(pangram_set)))
                score = 0
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
                        res.append(w)
                        if len(w) == 4: score +=1
                        elif len(w) > 4: score += len(w)
                        if is_pangram(w): 
                            score +=7
                            pangram = w
    
            s3 = boto3.client('s3')
            bucket_name = os.environ['BUCKET_NAME']
            data = {'letters':todays_letters, 'pangram': pangram, 'possible_words':res, 'center_letter': center_letter, 'maxscore': score}
            key = os.environ['FILE_KEY']
            response = s3.put_object(Bucket=bucket_name,Key=key,Body=json.dumps(data),ACL='public-read')
            return response

    ## for the return of letters and details from the api request
    if 'queryStringParameters' in event: 
        
        bucket_name = os.environ['BUCKET_NAME']
        key = os.environ['FILE_KEY']
        s3 = boto3.resource('s3')
        
        try:
            s3.Bucket(bucket_name).download_file(key, '/tmp/todays_letters.json')
        except ClientError as e:
            if e.response['Error']['Code'] == "404":
                return {
                            'statusCode': 404,
                            'body': 'Oops! Could not find today\'s word file.'
                        }
            else:
                return {
                            'statusCode': 500,
                            'body': "Uh oh, an error occurred"
                        }
            
        with open('/tmp/todays_letters.json', 'r') as rdfile: 
            data = rdfile.read()
            print(data)
            data = json.loads(data)
            
       
            return  {
                        'headers':{
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'statusCode': 200,
                        'body': json.dumps(data, indent=4)
                    }
          
        
                
       


    
