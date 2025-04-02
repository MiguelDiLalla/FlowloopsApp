from pathlib import Path

# Define base directory (relative to where the script is run)
# Get the current file's directory
base_dir = Path(__file__).parent 

# Define new vanilla folder structure and files to create
structure = {
    "": ["index.html"],  # Root level
    "styles": ["tailwind.css", "animations.css", "main.css"],
    "scripts": [
        "main.js",
        "timerManager.js",
        "notificationManager.js",
        "panels/titlePanel.js",
        "panels/buttonsPanel.js",
        "panels/historySidebar.js"
    ],
    "sounds": ["click.mp3"],  # Placeholder only; does not include actual media
    "icons": ["icon-192.png", "icon-512.png"],  # Placeholder icons
    "": ["manifest.json", "service-worker.js"]
}

# Create folders and files
for folder, files in structure.items():
    dir_path = base_dir / folder
    for file in files:
        file_path = dir_path / file
        file_path.parent.mkdir(parents=True, exist_ok=True)
        file_path.touch()

# Generate a list of all created files relative to base_dir
created_files = [str(p.relative_to(base_dir)) for p in base_dir.rglob("*") if p.is_file()]
import pandas as pd
import ace_tools as tools; tools.display_dataframe_to_user(name="FlowLoops Vanilla Scaffold", dataframe=pd.DataFrame(created_files, columns=["Created Files"]))
