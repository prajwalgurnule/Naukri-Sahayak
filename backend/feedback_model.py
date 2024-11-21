import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import sys
import json

def generate_feedback(correct_answer, user_answer):
    try:
        vectorizer = TfidfVectorizer()
        tfidf_matrix = vectorizer.fit_transform([correct_answer, user_answer])

        similarity_score = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        rating = round(similarity_score * 10)  # Rating out of 10

        # Return JSON response
        return json.dumps({"rating": rating})

    except Exception as e:
        # Return error message in JSON format
        return json.dumps({"error": str(e)})

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("Usage: python script.py <correct_answer> <user_answer>")
        sys.exit(1)

    correct_answer = sys.argv[1]
    user_answer = sys.argv[2]
    print(generate_feedback(correct_answer, user_answer))