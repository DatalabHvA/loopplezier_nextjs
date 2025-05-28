import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    app_name: str = "Loopplezier"
    environment: str = os.getenv('ENVIRONMENT', 'development')

    @property
    def port(self):
        return int(os.getenv('PROD_PORT', 8081)) if self.environment == 'production' else int(os.getenv('DEV_PORT', 8080))

settings = Settings()
