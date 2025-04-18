import asyncio
import json
import random
from websockets import serve


async def handler(websocket):
    await websocket.send("connected")

    async for message in websocket:
        try:
            data = json.loads(message)
            delay = data.get("delay", 0)
            req_id = data.get("id")
        except (ValueError, json.JSONDecodeError):
            delay = 0
            req_id = None

        if delay > 0:
            await asyncio.sleep(delay / 1000)

        response_data = [{"id": i, "value": random.random()}
                         for i in range(10)]

        response = {
            "status": "success",
            "delay": delay,
            "id": req_id,  # Devolver el mismo ID
            "data": response_data
        }

        await websocket.send(json.dumps(response))


async def main():
    # Configuración del servidor WebSocket con SSL
    async with serve(handler, "localhost", 5001):
        print("WebSocket server is running on wss://localhost:5001")
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())
