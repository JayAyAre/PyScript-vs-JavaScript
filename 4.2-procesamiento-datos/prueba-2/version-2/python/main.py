import asyncio
import sys

from pyscript import display, document, sync, window, PyWorker
from pyscript.ffi import create_proxy   # type: ignore


async def tick():
    counter = document.getElementById("counter")
    for i in range(100):
        counter.innerText = str(i)
        await asyncio.sleep(.1)


asyncio.create_task(tick())


print("Main running:", sys.version)


worker = PyWorker("./worker.py", type="pyodide",
                  config="./pyscript-worker.json")
await worker.ready

display("Calling worker...")
result = await worker.sync.take_a_long_time()
display("Done.")
display(f"result is: {result}")
print(result)


# async def on_worker_ready(event):
#     print("on_worker_ready", event)
#     result = await event.target.xworker.sync.take_a_long_time()
#     window.alert("result is:", result)


# document.getElementById("the-worker").addEventListener("py:ready", create_proxy(on_worker_ready))
