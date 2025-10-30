import re

# Core function to convert English to ASL gloss
def convertTranscriptToASLGloss(transcript):
    # Convert to uppercase (ASL gloss convention)
    text = transcript.upper().strip()
    
    # Remove punctuation except hyphens
    text = re.sub(r'[^\w\s-]', '', text)
    
    # Remove common articles (a, an, the)
    text = re.sub(r'\b(A|AN|THE)\b', '', text)
    
    # Remove "be verbs" (am, is, are, was, were, be, been, being)
    text = re.sub(r'\b(AM|IS|ARE|WAS|WERE|BE|BEEN|BEING)\b', '', text)
    
    # Convert contractions and possessives
    text = text.replace("I'M", "I")
    text = text.replace("YOU'RE", "YOU")
    text = text.replace("HE'S", "HE")
    text = text.replace("SHE'S", "SHE")
    text = text.replace("IT'S", "IT")
    text = text.replace("WE'RE", "WE")
    text = text.replace("THEY'RE", "THEY")
    text = text.replace("'S", "")  # Remove possessive 's
    text = text.replace("'", "")   # Remove remaining apostrophes
    
    # Convert verb tenses to base form (simplified)
    verb_conversions = {
        'WENT': 'GO',
        'GOING': 'GO',
        'GOES': 'GO',
        'GONE': 'GO',
        'ATE': 'EAT',
        'EATING': 'EAT',
        'EATS': 'EAT',
        'EATEN': 'EAT',
        'SAW': 'SEE',
        'SEEN': 'SEE',
        'SEEING': 'SEE',
        'SEES': 'SEE',
        'DID': 'DO',
        'DOING': 'DO',
        'DOES': 'DO',
        'DONE': 'DO',
        'HAD': 'HAVE',
        'HAS': 'HAVE',
        'HAVING': 'HAVE',
        'CAME': 'COME',
        'COMING': 'COME',
        'COMES': 'COME',
        'BOUGHT': 'BUY',
        'BUYING': 'BUY',
        'BUYS': 'BUY',
    }
    
    words = text.split()
    words = [verb_conversions.get(word, word) for word in words]
    
    # Remove extra whitespace
    gloss = ' '.join(words).strip()
    
    # Clean up multiple spaces
    gloss = re.sub(r'\s+', ' ', gloss)
    
    return gloss
