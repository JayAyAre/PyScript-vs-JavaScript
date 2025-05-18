import asyncio
import websockets
import json
import numpy as np

PORT = 5001


async def process_message(websocket, message):
    try:
        data = json.loads(message)
        delay = data.get("delay", 0)
        req_id = data.get("id")

        if delay > 0:
            await asyncio.sleep(delay / 1000)

        payload = {
            "id": req_id,
            "status": "success",
            "data": [{"id": i, "value": float(np.random.rand())} for i in range(10)]
        }
        await websocket.send(json.dumps(payload))
    except Exception as e:
        print(f"Error processing message: {e}")


async def handler(websocket):
    try:
        async for message in websocket:
            asyncio.create_task(process_message(websocket, message))
    except websockets.ConnectionClosed:
        print("🔴 Python WebSocket disconnected.")


async def main():
    print(f"Python WebSocket Server running on ws://localhost:{PORT}")
    async with websockets.serve(handler, "0.0.0.0", PORT):
        await asyncio.Future()


if __name__ == "__main__":
    asyncio.run(main())
