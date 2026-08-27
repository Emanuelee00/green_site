import uvicorn
import yaml

with open("config/config.yaml") as f:
    config = yaml.safe_load(f)

if __name__ == "__main__":
    uvicorn.run(
        "api.main:app",
        host=config["server"]["host"],
        port=config["server"]["port"],
        reload=True,
    )
