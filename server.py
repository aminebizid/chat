import asyncio
import json
import websockets

async def simulate_streaming_response(websocket, message):
    await websocket.send(json.dumps({"type": "stream-start"}))
    
    response = f'Thank you for your message: "{message}". This is a simulated streaming response.'
    
    for i in range(0, len(response), 3):
        chunk = response[i:i+3]
        await websocket.send(json.dumps({"content": chunk}))
        await asyncio.sleep(0.1)  # 100ms delay between chunks
    
    await websocket.send(json.dumps({"type": "stream-end"}))

async def handle_connection(websocket):
    print("Client connected")
    try:
        async for message in websocket:
            data = json.loads(message)
            await simulate_streaming_response(websocket, data["message"])
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        print("Client disconnected")

async def main():
    # Listen on all interfaces (0.0.0.0) instead of just localhost
    async with websockets.serve(handle_connection, "0.0.0.0", 3001):
        print("WebSocket server started on ws://0.0.0.0:3001")
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    asyncio.run(main())