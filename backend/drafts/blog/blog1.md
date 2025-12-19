---
slug: building-blocks-celery-fastapi
title: "Building Blocks of Celery and FastAPI: Asynchronous Task Processing"
summary: "A comprehensive guide to integrating Celery with FastAPI for efficient background task processing, from basic setup to production-ready implementation with monitoring."
category: "Backend"
tags: ["Python", "FastAPI", "Celery", "Redis", "Async", "Tutorial"]
readTime: "15 min"
---

# Building Blocks of Celery and FastAPI

Creating API responses outside of the current application flow is essential for building responsive, scalable web applications. Let's explore how to achieve this using FastAPI and Celery.

## Background Tasks in FastAPI

In applications built with FastAPI, there's a built-in class called `BackgroundTasks` where a task runs on the application event loop and returns output when ready.

To define a view that uses background tasks:

```python
from fastapi import BackgroundTasks

# Background task - sync or async based on what it does
def send_email(email: str, message: str):
    # I/O operation - could be async, but sync works fine here
    time.sleep(1)  # simulate sending
    print(f"Email sent to {email}")

# View - async for consistency and performance
@app.post("/notify")
async def notify_user(email: str, background_tasks: BackgroundTasks):
    background_tasks.add_task(send_email, email, "Welcome!")
    return {"message": "Notification queued"}
```

**The pattern is clear:** async view + task queuing takes microseconds, task runs in background without blocking other requests.

**Use async background tasks** only if they perform async I/O (database calls, HTTP requests with `httpx`, etc.):

```python
# Async background task for async operations
async def fetch_and_store(url: str):
    async with httpx.AsyncClient() as client:
        data = await client.get(url)
        # process data
```

## Why Celery?

As you build out your web app, you should ensure that the response time of a particular view is lower than 500ms. Application Performance Monitoring tools can help surface potential issues and isolate longer processes that could be moved to a background process managed by Celery.

[Celery](https://docs.celeryq.dev/) is an open source, asynchronous task queue that's often coupled with Python-based web frameworks like FastAPI, Django, or Flask to manage background work outside the typical request/response cycle. You can return an HTTP response immediately and run the process as a background task, instead of forcing the user to wait for the task to finish.

### When to Use Celery Instead of BackgroundTasks

1. **CPU Intensive Tasks**: Celery should be used for tasks that perform heavy background computations since `BackgroundTasks` runs in the same event loop that serves your app's requests.

2. **Task Queue Management**: If you require a task queue to manage tasks and workers, use Celery. Often you'll want to retrieve the status of a job and perform actions based on that status—send an error email, kick off a different background task, or retry the task. Celery manages all this for you.

## Message Broker and Result Backend

- **Message broker**: An intermediary program used as the transport for producing or consuming tasks.
- **Result backend**: Storage for Celery task results.

The Celery client (producer) adds a new task to the queue via the message broker. Celery workers then consume tasks from the queue. Once processed, results are stored in the result backend.

**[Image: Celery Architecture Diagram - Shows flow from FastAPI Client → Message Broker (Redis) → Celery Worker → Result Backend (Redis)]**

### Understanding the Components

#### 1. Message Broker (Redis/RabbitMQ)

Infrastructure that runs externally, configured via URL:

```python
# No code - just a running service
Redis: redis://localhost:6379/0
RabbitMQ: amqp://localhost:5672
```

#### 2. Celery Client (Task Producer)

Your FastAPI app that sends tasks to the queue:

```python
from celery_app import celery_app

@app.post("/fetch")
async def trigger_fetch(url: str):
    # This line is the "client" - it sends task to broker
    task = celery_app.send_task("tasks.fetch_and_store", args=[url])
    return {"task_id": task.id}
```

#### 3. Celery Workers (Task Consumer)

Separate process that executes tasks:

```python
# tasks.py - This IS the worker code
from celery_app import celery_app
import httpx

@celery_app.task(name="tasks.fetch_and_store")
def fetch_and_store(url: str):
    # Worker executes this when task consumed from broker
    response = httpx.get(url)
    data = response.json()
    # process and store data
    return {"status": "complete", "data": data}
```

#### 4. Result Backend (Redis/Database)

Storage for task results, configured via URL:

```python
# celery_app.py
from celery import Celery

celery_app = Celery(
    "worker",
    broker="redis://localhost:6379/0",      # Message broker
    backend="redis://localhost:6379/1"      # Result backend
)
```

Results are fetched via `task_id`:

```python
@app.get("/result/{task_id}")
async def get_result(task_id: str):
    result = celery_app.AsyncResult(task_id)
    return {
        "status": result.status,
        "result": result.result if result.ready() else None
    }
```

## Setting Up Celery

**[Image: Setup Flow Diagram - Shows Docker → Redis → FastAPI → Celery Worker setup sequence]**

### Step 1: Install and Run Redis

You can set up Redis directly on your OS or via Docker container.

Start by installing [Docker](https://docs.docker.com/get-docker/), then run:

```bash
docker run -p 6379:6379 --name some-redis -d redis
```

This downloads the official Redis Docker image and runs it on port 6379 in the background.

Test if Redis is running:

```bash
docker exec -it some-redis redis-cli ping
```

You should see: `PONG`

### Step 2: Create FastAPI Project

Create a new project directory:

```bash
mkdir fastapi-celery-project && cd fastapi-celery-project
```

Create and activate a virtual environment:

```bash
python3.11 -m venv venv
source venv/bin/activate
```

Create `requirements.txt`:

```
fastapi==0.108.0
uvicorn[standard]==0.25.0
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create `main.py`:

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}
```

Run the app:

```bash
uvicorn main:app --reload
```

Visit [http://localhost:8000](http://localhost:8000/) to verify installation.

### Step 3: Add Celery

Update `requirements.txt`:

```
celery==5.3.6
redis==5.0.1
```

Install:

```bash
pip install -r requirements.txt
```

Update `main.py`:

```python
from celery import Celery
from fastapi import FastAPI

app = FastAPI()

celery = Celery(
    __name__,
    broker="redis://127.0.0.1:6379/0",
    backend="redis://127.0.0.1:6379/0"
)

@app.get("/")
async def root():
    return {"message": "Hello World"}

@celery.task
def divide(x, y):
    import time
    time.sleep(5)
    return x / y
```

**Key Points:**

1. After creating a FastAPI instance, we created a Celery instance
2. `broker` and `backend` tell Celery to use the Redis service
3. We defined a `divide` task that simulates a long-running operation

## Sending Tasks to Celery

Start the Celery worker in a new terminal:

```bash
celery -A main.celery worker --loglevel=info
```

You should see:

```bash
[config]
.> app:         main:0x10ad0d5f8
.> transport:   redis://127.0.0.1:6379/0
.> results:     redis://127.0.0.1:6379/0
.> concurrency: 8 (prefork)

[queues]
.> celery           exchange=celery(direct) key=celery

[tasks]
  . main.divide
```

In another terminal, test sending tasks:

```bash
python
```

```python
>>> from main import app, divide
>>> task = divide.delay(1, 2)
```

**What's happening:**

1. The `delay` method sends a message to the broker
2. The worker picks up and executes the task from the queue
3. Code execution continues immediately while the task runs in background

Check the worker terminal for task execution logs:

```bash
[2024-01-04 15:40:53,959: INFO/MainProcess] Task main.divide[3d5b4872-2fa4-4e08-b916-aadf59f54271] received
[2024-01-04 15:40:58,978: INFO/ForkPoolWorker-16] Task main.divide[3d5b4872-2fa4-4e08-b916-aadf59f54271] succeeded in 5.0168835959921125s: 0.5
```

### Understanding AsyncResult

The `delay` method returns an `AsyncResult` instance for checking task state:

```python
>>> task = divide.delay(1, 2)
>>> type(task)
<class 'celery.result.AsyncResult'>

>>> print(task.state, task.result)
PENDING None

>>> print(task.state, task.result)
PENDING None

>>> print(task.state, task.result)
SUCCESS 0.5
```

**Error handling:**

```python
>>> task = divide.delay(1, 0)
# wait a few seconds
>>> task.state
'FAILURE'

>>> task.result
ZeroDivisionError('division by zero')
```

## Monitoring with Flower

[Flower](https://flower.readthedocs.io/) is a real-time web application for monitoring and administering Celery.

Add to `requirements.txt`:

```
flower==2.0.1
```

Install and run:

```bash
pip install -r requirements.txt
celery -A main.celery flower --port=5555
```

Navigate to [http://localhost:5555](http://localhost:5555/) to view the dashboard.

Test with multiple tasks:

```python
>>> task = divide.delay(1, 2)
>>> task = divide.delay(1, 0)
>>> task = divide.delay(1, 3)
```

**[Image: Flower Dashboard Screenshot - Shows task list with UUID, status, and results columns]**

In Flower, you can inspect individual tasks using their UUID:

```python
>>> from celery.result import AsyncResult
>>> task = AsyncResult('8e3da1cc-a6aa-42ba-ab72-6ca7544d3730')
>>> task.state
'FAILURE'
>>> task.result
ZeroDivisionError('division by zero')
```

## Building the API

Let's create endpoints that trigger tasks and retrieve results.

### Create Task Endpoint

Update `main.py`:

```python
@app.post("/tasks", status_code=201)
async def run_task(x: int, y: int):
    task = divide.delay(x, y)
    return {"task_id": task.id, "status": task.state}
```

This endpoint:

- Accepts two integers
- Sends them to the Celery worker via the `divide` task
- Returns task ID and initial status immediately

Test it:

```bash
curl -X POST "http://localhost:8000/tasks?x=10&y=2"
```

Response:

```json
{
  "task_id": "3d5b4872-2fa4-4e08-b916-aadf59f54271",
  "status": "PENDING"
}
```

### Retrieve Task Result

Add the result endpoint:

```python
from celery import Celery
from celery.result import AsyncResult
from fastapi import FastAPI

@app.get("/tasks/{task_id}")
async def get_task_result(task_id: str):
    task = AsyncResult(task_id, app=celery)

    if task.state == "PENDING":
        return {
            "task_id": task_id,
            "status": task.state,
            "result": None
        }
    elif task.state == "FAILURE":
        return {
            "task_id": task_id,
            "status": task.state,
            "result": str(task.result)
        }
    else:
        return {
            "task_id": task_id,
            "status": task.state,
            "result": task.result
        }
```

This endpoint handles three task states:

- **PENDING**: Task is still processing or doesn't exist
- **FAILURE**: Task failed with an error
- **SUCCESS**: Task completed successfully

Test the result endpoint:

```bash
curl "http://localhost:8000/tasks/3d5b4872-2fa4-4e08-b916-aadf59f54271"
```

Success response:

```json
{
  "task_id": "3d5b4872-2fa4-4e08-b916-aadf59f54271",
  "status": "SUCCESS",
  "result": 5.0
}
```

## Conclusion

Throughout this guide, we've explored how Celery enables asynchronous task processing in FastAPI applications, allowing you to offload time-consuming operations and maintain responsive API endpoints. By leveraging Redis as both a message broker and result backend, you can build scalable applications that handle background tasks efficiently without blocking your main application flow.

### Key Takeaways

- **Task queues vs BackgroundTasks**: Use Celery for CPU-intensive operations and complex task management
- **Producer/Consumer model**: Understand how the Celery client produces tasks and workers consume them
- **Setup and configuration**: Integrate Celery with FastAPI using Redis as broker and backend
- **Monitoring**: Use Flower for real-time task monitoring and debugging
- **API patterns**: Implement async endpoints that trigger tasks and retrieve results

With this foundation, you're ready to build production-ready applications that handle background processing efficiently, maintain excellent response times, and scale gracefully under load.
