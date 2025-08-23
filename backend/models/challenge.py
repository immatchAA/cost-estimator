from pydantic import BaseModel

class ChallengeCreate(BaseModel):
    challenge_name: str
    challenge_objectives: str
    challenge_instructions: str
    file_url: str


