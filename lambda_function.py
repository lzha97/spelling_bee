import json

def lambda_handler(event, context):
    # TODO implement

    with open('validwords.json', 'r') as dictfile:
        worddict = json.load(dictfile)
    
    letters = event["queryStringParameters"]['letters']
    print(letters)
    
    res = [] 
    center_letter = letters[3]

    for w in worddict: 
        flag = True
        for c in w: 
            if c not in letters: 
                flag = False 
        if center_letter not in w: 
            flag = False 
        if flag == True: res.append(w)

    return {
        'statusCode': 200,
        'body': json.dumps(res)
    }