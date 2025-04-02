import subprocess
import os
import time

base_dir = os.path.abspath(os.path.dirname(__file__))

commands = [
    ("Server HTTP", ["python", "-m", "http.server", "8000"], base_dir),
]

processes = []

try:
    for name, cmd, cwd in commands:
        if not os.path.isdir(cwd):
            print(
                f"⚠️ Error: The folder {cwd} does not exist. skipping {name}...")
            continue

        print(f"Starting {name}...")
        process = subprocess.Popen(
            cmd, cwd=cwd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True)
        processes.append((name, process))
        time.sleep(1)

    print("✅ All servers started.")

    while True:
        time.sleep(10)

except KeyboardInterrupt:
    print("\n🛑 Stopping servers...")
    for name, process in processes:
        print(f"🔴 Closing {name}...")
        process.terminate()
    print("✅ All servers stopped.")
