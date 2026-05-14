from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://passerelle:passerelle@localhost:5432/passerelle"
    UPLOAD_DIR: str = "./uploads"
    OPENAI_API_KEY: str = ""
    SECRET_KEY: str = "change_me_local_dev_only"
    ENVIRONMENT: str = "development"

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
