# PostgreSQL Docker Setup Guide (Windows)

This guide explains how to run PostgreSQL in Docker for the ChiliopusNotify project on Windows.

## Prerequisites

- **Docker Desktop** installed and running
- **Windows 10/11** (64-bit)
- **PowerShell** or **Command Prompt**

## Quick Start

### Step 1: Navigate to Docker Directory

Open PowerShell or Command Prompt and navigate to the docker directory:

```powershell
cd D:\igniquest-ekajalaka\chiliopus\infrastructure\notify\docker
```

### Step 2: Start PostgreSQL Container

```powershell
docker-compose -f docker-compose.postgres.yml up -d
```

**Note:** The container group will appear as "chiliopus-notify" in Docker Desktop (not "docker"). This is configured via the `name` field in the docker-compose file.

**What this does:**
- Downloads PostgreSQL 16 Alpine image (if not already downloaded)
- Creates and starts the `chiliopus-postgres` container
- Automatically initializes the database schema from `src/db/schema.sql`
- Creates a persistent volume for data storage

### Step 3: Verify Container is Running

```powershell
docker ps
```

You should see `chiliopus-postgres` in the list with status "Up".

### Step 4: Check Logs (Optional)

```powershell
docker logs chiliopus-postgres
```

Or follow logs in real-time:

```powershell
docker logs -f chiliopus-postgres
```

## Database Connection Details

Once the container is running, you can connect using:

- **Host:** `localhost`
- **Port:** `5432`
- **Database:** `chiliopus_notify`
- **Username:** `postgres`
- **Password:** `postgres`

**Connection String:**
```
postgres://postgres:postgres@localhost:5432/chiliopus_notify
```

## Common Operations

### Connect to PostgreSQL (Interactive Shell)

```powershell
docker exec -it chiliopus-postgres psql -U postgres -d chiliopus_notify
```

Once connected, you can run SQL commands:
```sql
-- List all tables
\dt

-- Check notifications
SELECT * FROM notifications LIMIT 5;

-- Exit
\q
```

### Execute SQL File

```powershell
docker exec -i chiliopus-postgres psql -U postgres -d chiliopus_notify < ..\src\db\schema.sql
```

Or using PowerShell:

```powershell
Get-Content ..\src\db\schema.sql | docker exec -i chiliopus-postgres psql -U postgres -d chiliopus_notify
```

### Run SQL Command

```powershell
docker exec -it chiliopus-postgres psql -U postgres -d chiliopus_notify -c "SELECT version();"
```

### Stop Container

```powershell
docker-compose -f docker-compose.postgres.yml stop
```

**Note:** Data is preserved in the Docker volume.

### Start Container (After Stopping)

```powershell
docker-compose -f docker-compose.postgres.yml start
```

### Stop and Remove Container

```powershell
docker-compose -f docker-compose.postgres.yml down
```

**Note:** This stops the container but **keeps the data volume**.

### Remove Container and Data Volume

**⚠️ WARNING: This will delete all database data!**

```powershell
docker-compose -f docker-compose.postgres.yml down -v
```

## Update Your .env File

After starting PostgreSQL, update your `.env` file in the project root:

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/chiliopus_notify
```

## Schema Initialization

The database schema is automatically initialized when the container starts for the first time. The schema file (`src/db/schema.sql`) is mounted into the container's initialization directory.

**Important Notes:**
- Schema initialization only happens on **first start** (when the data volume is empty)
- If you need to reinitialize the schema, you must remove the volume first:
  ```powershell
  docker-compose -f docker-compose.postgres.yml down -v
  docker-compose -f docker-compose.postgres.yml up -d
  ```

## Troubleshooting

### Port 5432 Already in Use

**Error:** `Bind for 0.0.0.0:5432 failed: port is already allocated`

**Solution 1:** Stop the conflicting service
```powershell
# Find what's using port 5432
netstat -ano | findstr :5432

# Stop the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

**Solution 2:** Use a different port
Edit `docker-compose.postgres.yml`:
```yaml
ports:
  - "5433:5432"  # Use 5433 instead of 5432
```

Then update your `.env`:
```env
DATABASE_URL=postgres://postgres:postgres@localhost:5433/chiliopus_notify
```

### Container Won't Start

**Check logs:**
```powershell
docker logs chiliopus-postgres
```

**Common issues:**
- Docker Desktop not running → Start Docker Desktop
- Insufficient disk space → Free up space
- Permission issues → Run PowerShell as Administrator

### Connection Refused

**Verify container is running:**
```powershell
docker ps | findstr chiliopus-postgres
```

**Check container health:**
```powershell
docker inspect chiliopus-postgres | findstr Health
```

**Test connection:**
```powershell
docker exec -it chiliopus-postgres pg_isready -U postgres
```

### Database Not Found

If you see "database does not exist" error:

1. **Check if database exists:**
   ```powershell
   docker exec -it chiliopus-postgres psql -U postgres -l
   ```

2. **Create database manually (if needed):**
   ```powershell
   docker exec -it chiliopus-postgres psql -U postgres -c "CREATE DATABASE chiliopus_notify;"
   ```

3. **Reinitialize schema:**
   ```powershell
   Get-Content ..\src\db\schema.sql | docker exec -i chiliopus-postgres psql -U postgres -d chiliopus_notify
   ```

### Schema Not Initialized

If tables are missing:

1. **Check if schema file is mounted correctly:**
   ```powershell
   docker exec -it chiliopus-postgres ls -la /docker-entrypoint-initdb.d/
   ```

2. **Manually run schema:**
   ```powershell
   Get-Content ..\src\db\schema.sql | docker exec -i chiliopus-postgres psql -U postgres -d chiliopus_notify
   ```

### Container Keeps Restarting

**Check logs for errors:**
```powershell
docker logs chiliopus-postgres
```

**Common causes:**
- Corrupted data volume
- Permission issues
- Insufficient resources

**Solution:** Remove and recreate:
```powershell
docker-compose -f docker-compose.postgres.yml down -v
docker-compose -f docker-compose.postgres.yml up -d
```

## Data Persistence

Data is stored in a Docker volume named `postgres_data`. This means:

- ✅ Data persists when container stops
- ✅ Data persists when container is removed (unless you use `-v` flag)
- ✅ Data persists across Docker Desktop restarts

**View volumes:**
```powershell
docker volume ls
```

**Inspect volume:**
```powershell
docker volume inspect docker_postgres_data
```

**Backup data:**
```powershell
docker exec chiliopus-postgres pg_dump -U postgres chiliopus_notify > backup.sql
```

**Restore data:**
```powershell
Get-Content backup.sql | docker exec -i chiliopus-postgres psql -U postgres -d chiliopus_notify
```

## Using with ChiliopusNotify Project

Once PostgreSQL is running:

1. **Update `.env` file:**
   ```env
   DATABASE_URL=postgres://postgres:postgres@localhost:5432/chiliopus_notify
   ```

2. **Start the API server:**
   ```powershell
   cd ..
   npm run dev
   ```

3. **Start the worker:**
   ```powershell
   npm run dev:worker
   ```

The application will automatically connect to the PostgreSQL container.

## Alternative: Using Full Stack Docker Compose

If you want to run the entire stack (API, Worker, Redis, PostgreSQL) together, use:

```powershell
cd docker
docker-compose up -d
```

This uses the main `docker-compose.yml` file which includes all services.

## Useful Commands Reference

| Command | Description |
|---------|-------------|
| `docker-compose -f docker-compose.postgres.yml up -d` | Start PostgreSQL in background |
| `docker-compose -f docker-compose.postgres.yml stop` | Stop PostgreSQL |
| `docker-compose -f docker-compose.postgres.yml start` | Start PostgreSQL (after stop) |
| `docker-compose -f docker-compose.postgres.yml down` | Stop and remove container |
| `docker-compose -f docker-compose.postgres.yml down -v` | Remove container and data |
| `docker ps` | List running containers |
| `docker logs chiliopus-postgres` | View logs |
| `docker exec -it chiliopus-postgres psql -U postgres -d chiliopus_notify` | Connect to database |

## Next Steps

1. ✅ Start PostgreSQL container
2. ✅ Verify it's running
3. ✅ Update `.env` with connection string
4. ✅ Test connection from your application
5. ✅ Start developing!

For more information, see the main [README.md](../README.md).
